import { Controller, Post, Get, Body, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginDto, RegisterDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    this.setCookies(res, result.accessToken, '');
    return { accessToken: result.accessToken, user: result.user };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setCookies(res, result.accessToken, '');
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    const opts = this.authService.getCookieOptions();
    res.clearCookie('access_token', opts);
    res.clearCookie('refreshToken', opts);
    return { message: 'Logged out' };
  }

  @Public()
  @Get('refresh-tokens')
  async refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    const result = await this.authService.refreshTokens(refreshToken);
    this.setCookies(res, result.accessToken, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const opts = this.authService.getCookieOptions();
    res.cookie('access_token', accessToken, { ...opts, maxAge: 15 * 60 * 1000 });
    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, { ...opts, maxAge: 30 * 24 * 60 * 60 * 1000 });
    }
  }
}
