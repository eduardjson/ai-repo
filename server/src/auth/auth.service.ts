import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const { password, ...result } = user;
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: result,
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    // Rotate atomically: revoke the used token and issue a fresh pair.
    return this.prisma.$transaction(async (tx) => {
      const tokenRecord = await tx.token.findUnique({
        where: { token: refreshToken },
      });

      if (!tokenRecord || tokenRecord.expires < new Date()) {
        if (tokenRecord) {
          await tx.token.delete({ where: { id: tokenRecord.id } });
        }
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await tx.user.findUnique({
        where: { id: tokenRecord.userId },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      await tx.token.delete({ where: { id: tokenRecord.id } });

      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: ACCESS_TOKEN_TTL,
      });
      const newRefreshToken = uuidv4();
      const expires = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
      await tx.token.create({
        data: { token: newRefreshToken, expires, userId: user.id },
      });

      const { password, ...result } = user;
      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: result,
      };
    });
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.token.deleteMany({ where: { token: refreshToken } });
    }
  }

  private async generateTokens(userId: string, email: string, role: string[]) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_TTL,
    });

    const refreshToken = uuidv4();
    const expires = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await this.prisma.token.create({
      data: { token: refreshToken, expires, userId },
    });

    return { accessToken, refreshToken };
  }

  getRefreshTokenCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/api/auth',
      maxAge: REFRESH_TOKEN_TTL_MS,
    };
  }
}
