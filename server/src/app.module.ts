import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { ObjectModule } from './object/object.module';
import { ShipmentModule } from './shipment/shipment.module';
import { ChatModule } from './chat/chat.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { JWTAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    ProductModule,
    WarehouseModule,
    ObjectModule,
    ShipmentModule,
    ChatModule,
    AttachmentsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JWTAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
