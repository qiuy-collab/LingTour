import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersExpiryService } from './orders-expiry.service';
import { OrdersController } from './orders.controller';
import { StoreProduct } from '../shop/entities/store-product.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, StoreProduct]),
    NotificationsModule,
    SettingsModule,
    EmailModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersExpiryService],
  exports: [OrdersService],
})
export class OrdersModule {}
