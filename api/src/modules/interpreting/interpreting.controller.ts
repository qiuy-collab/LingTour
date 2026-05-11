import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InterpretingService } from './interpreting.service';
import { SetServiceModesDto } from './dto/set-service-modes.dto';
import { SetProfilesDto } from './dto/set-profiles.dto';
import { SetFaqsDto } from './dto/set-faqs.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Interpreting')
@Controller('api/v1')
export class InterpretingController {
  constructor(private readonly interpretingService: InterpretingService) {}

  // ── Public ──

  @Public()
  @Get('public/interpreting')
  @ApiOperation({ summary: 'Get full interpreting page data' })
  async getPublicData() {
    return this.interpretingService.getPublicPageData();
  }

  @Public()
  @Post('public/bookings')
  @ApiOperation({ summary: 'Submit booking request' })
  async submitBooking(@Body() dto: CreateBookingDto) {
    return this.interpretingService.submitBooking(dto);
  }

  // ── Admin: Config ──

  @Get('admin/interpreting')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get interpreting config (admin)' })
  async getAdminConfig() {
    return this.interpretingService.getAdminConfig();
  }

  @Put('admin/interpreting/service-modes')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Full replace service modes' })
  async setServiceModes(@Body() dto: SetServiceModesDto) {
    return this.interpretingService.replaceServiceModes(dto.service_modes);
  }

  @Put('admin/interpreting/profiles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Full replace interpreter profiles' })
  async setProfiles(@Body() dto: SetProfilesDto) {
    return this.interpretingService.replaceProfiles(dto.profiles);
  }

  @Put('admin/interpreting/faqs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Full replace FAQs' })
  async setFaqs(@Body() dto: SetFaqsDto) {
    return this.interpretingService.replaceFaqs(dto.faqs);
  }

  // ── Admin: Bookings ──

  @Get('admin/bookings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List bookings (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'q', required: false })
  async getBookings(
    @Query('page') page = 1,
    @Query('size') size = 20,
    @Query('status') status?: string,
    @Query('q') q?: string,
  ) {
    return this.interpretingService.findBookingsAdmin(+page, +size, status, q);
  }

  @Get('admin/bookings/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking detail (admin)' })
  async getBooking(@Param('id', ParseUUIDPipe) id: string) {
    return this.interpretingService.findBookingByIdAdmin(id);
  }

  @Put('admin/bookings/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking status' })
  async updateBookingStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.interpretingService.updateBookingStatus(id, dto.status);
  }
}
