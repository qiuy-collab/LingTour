import { Controller, Get, Query, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { TravelerBookingsService } from './traveler-bookings.service';

type AuthenticatedRequest = Request & {
  user?: { sub: string; email: string; role: string };
};

@ApiTags('Traveler bookings')
@ApiBearerAuth()
@Controller('api/v1/account/interpreting')
export class TravelerBookingsController {
  constructor(private readonly travelerBookings: TravelerBookingsService) {}

  @Get('bookings')
  @ApiOperation({
    summary: 'List interpreting bookings for the signed-in traveler',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async listMine(
    @Req() request: AuthenticatedRequest,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 12,
  ) {
    return this.travelerBookings.findForTraveler(
      request.user?.email,
      Number(page),
      Number(pageSize),
    );
  }
}
