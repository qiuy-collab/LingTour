import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Headers,
  Req,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { RefundOrderDto } from './dto/refund-order.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentStatus,
} from './entities/order.entity';
import { AuditInterceptor, AuditAction } from '../../common/interceptors/audit.interceptor';

@ApiTags('Orders')
@Controller('api/v1')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ── Public: Checkout ──

  @Public()
  @Post('orders/checkout')
  @ApiOperation({ summary: 'Create order (guest or logged-in user)' })
  async checkout(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  // ── Stripe Webhook (public, but signature-verified) ──

  @Public()
  @Post('webhooks/stripe')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request,
  ) {
    const rawBody = (req as any).rawBody;
    return this.ordersService.handleStripeWebhook(
      signature,
      rawBody ?? Buffer.from(JSON.stringify(req.body ?? {})),
    );
  }

  // ── Admin ──

  @Roles('admin', 'editor')
  @Get('admin/orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List orders (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ORDER_STATUSES })
  @ApiQuery({
    name: 'paymentStatus',
    required: false,
    enum: PAYMENT_STATUSES,
  })
  async getOrders(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: OrderStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
  ) {
    return this.ordersService.findAllAdmin(+page, +limit, status, paymentStatus);
  }

  @Roles('admin', 'editor')
  @Get('admin/orders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order detail (admin)' })
  async getOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findByIdAdmin(id);
  }

  @Roles('admin', 'editor')
  @Patch('admin/orders/:id/status')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'order')
  @ApiOperation({ summary: 'Update order status (admin)' })
  async updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatusAdmin(id, dto.status);
  }

  @Roles('admin', 'editor')
  @Patch('admin/orders/:id/ship')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'order')
  @ApiOperation({ summary: 'Mark order as shipped (admin)' })
  async shipOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ShipOrderDto,
  ) {
    return this.ordersService.shipOrder(id, dto.trackingNo);
  }

  @Patch('admin/orders/:id/refund')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('refund', 'order')
  @ApiOperation({ summary: 'Refund order (admin)' })
  async refundOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RefundOrderDto,
  ) {
    return this.ordersService.refundOrder(id, dto.reason);
  }
}
