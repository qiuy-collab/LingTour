import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Headers,
  Req,
  ParseUUIDPipe,
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
import { Public } from '../../common/decorators/public.decorator';

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

  @Get('admin/orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List orders (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getOrders(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.ordersService.findAllAdmin(+page, +limit, status);
  }

  @Get('admin/orders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order detail (admin)' })
  async getOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findByIdAdmin(id);
  }
}
