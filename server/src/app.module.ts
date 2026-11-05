import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { UnitModule } from './unit/unit.module';
import { ProductModule } from './product/product.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { ObjectModule } from './object/object.module';
import { ShipmentModule } from './shipment/shipment.module';
import { ReceiptModule } from './receipt/receipt.module';
import { ChatModule } from './chat/chat.module';
import { ProjectModule } from './project/project.module';
import { TransferModule } from './transfer/transfer.module';
import { JWTAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    CategoryModule,
    ManufacturerModule,
    UnitModule,
    ProductModule,
    WarehouseModule,
    ObjectModule,
    ShipmentModule,
    ReceiptModule,
    ChatModule,
    ProjectModule,
    TransferModule,
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
