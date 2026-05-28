import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
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
import { ConfirmBookingDepositDto } from './dto/confirm-booking-deposit.dto';
import { CreateModeDto } from './dto/create-mode.dto';
import { UpdateModeDto } from './dto/update-mode.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditInterceptor, AuditAction } from '../../common/interceptors/audit.interceptor';

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

  @Public()
  @Post('public/bookings/checkout')
  @ApiOperation({
    summary: 'Submit booking request and create deposit checkout',
  })
  async submitBookingWithDeposit(@Body() dto: CreateBookingDto) {
    return this.interpretingService.submitBookingWithDeposit(dto);
  }

  @Public()
  @Post('public/bookings/:id/confirm-deposit')
  @ApiOperation({ summary: 'Confirm interpreting booking deposit payment' })
  async confirmBookingDeposit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmBookingDepositDto,
  ) {
    return this.interpretingService.confirmBookingDeposit(
      id,
      dto.orderNo,
      dto.paymentId,
    );
  }

  // ── Admin: Config ──

  @Roles('admin', 'editor')
  @Get('admin/interpreting')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get interpreting config (admin)' })
  async getAdminConfig() {
    return this.interpretingService.getAdminConfig();
  }

  @Roles('admin', 'editor')
  @Put('admin/interpreting/service-modes')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'service_modes')
  @ApiOperation({ summary: 'Full replace service modes' })
  async setServiceModes(@Body() dto: SetServiceModesDto) {
    return this.interpretingService.replaceServiceModes(dto.service_modes);
  }

  @Roles('admin', 'editor')
  @Put('admin/interpreting/profiles')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'interpreter_profiles')
  @ApiOperation({ summary: 'Full replace interpreter profiles' })
  async setProfiles(@Body() dto: SetProfilesDto) {
    return this.interpretingService.replaceProfiles(dto.profiles);
  }

  @Roles('admin', 'editor')
  @Put('admin/interpreting/faqs')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'faqs')
  @ApiOperation({ summary: 'Full replace FAQs' })
  async setFaqs(@Body() dto: SetFaqsDto) {
    return this.interpretingService.replaceFaqs(dto.faqs);
  }

  @Roles('admin', 'editor')
  @Get('admin/interpreting/modes')
  @ApiBearerAuth()
  async listModes(@Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return this.interpretingService.findModesAdmin(+page, +pageSize);
  }

  @Roles('admin', 'editor')
  @Get('admin/interpreting/modes/:id')
  @ApiBearerAuth()
  async getMode(@Param('id', ParseUUIDPipe) id: string) {
    return this.interpretingService.findModeByIdAdmin(id);
  }

  @Roles('admin', 'editor')
  @Post('admin/interpreting/modes')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('create', 'service_mode')
  async createMode(@Body() body: CreateModeDto) {
    return this.interpretingService.createMode(body);
  }

  @Roles('admin', 'editor')
  @Put('admin/interpreting/modes/:id')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'service_mode')
  async updateMode(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateModeDto) {
    return this.interpretingService.updateMode(id, body);
  }

  @Roles('admin', 'editor')
  @Patch('admin/interpreting/modes/:id/sort')
  @ApiBearerAuth()
  async updateModeSort(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('sortOrder') sortOrder: number,
  ) {
    return this.interpretingService.updateModeSort(id, +sortOrder);
  }

  @Delete('admin/interpreting/modes/:id')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('delete', 'service_mode')
  async deleteMode(@Param('id', ParseUUIDPipe) id: string) {
    return this.interpretingService.deleteMode(id);
  }

  @Roles('admin', 'editor')
  @Get('admin/interpreting/profiles')
  @ApiBearerAuth()
  async listProfiles(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('status') status?: string,
  ) {
    return this.interpretingService.findProfilesAdmin(+page, +pageSize, status);
  }

  @Roles('admin', 'editor')
  @Get('admin/interpreting/profiles/:id')
  @ApiBearerAuth()
  async getProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.interpretingService.findProfileByIdAdmin(id);
  }

  @Roles('admin', 'editor')
  @Post('admin/interpreting/profiles')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('create', 'interpreter_profile')
  async createProfile(@Body() body: CreateProfileDto) {
    return this.interpretingService.createProfile(body);
  }

  @Roles('admin', 'editor')
  @Put('admin/interpreting/profiles/:id')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'interpreter_profile')
  async updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateProfileDto,
  ) {
    return this.interpretingService.updateProfile(id, body);
  }

  @Roles('admin', 'editor')
  @Patch('admin/interpreting/profiles/:id/status')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'interpreter_profile')
  async updateProfileStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.interpretingService.updateProfileStatus(id, status);
  }

  @Delete('admin/interpreting/profiles/:id')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('delete', 'interpreter_profile')
  async deleteProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.interpretingService.deleteProfile(id);
  }

  @Roles('admin', 'editor')
  @Get('admin/interpreting/faqs')
  @ApiBearerAuth()
  async listFaqs(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('category') category?: string,
  ) {
    return this.interpretingService.findFaqsAdmin(+page, +pageSize, category);
  }

  @Roles('admin', 'editor')
  @Get('admin/interpreting/faqs/:id')
  @ApiBearerAuth()
  async getFaq(@Param('id', ParseUUIDPipe) id: string) {
    return this.interpretingService.findFaqByIdAdmin(id);
  }

  @Roles('admin', 'editor')
  @Post('admin/interpreting/faqs')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('create', 'faq')
  async createFaq(@Body() body: CreateFaqDto) {
    return this.interpretingService.createFaq(body);
  }

  @Roles('admin', 'editor')
  @Put('admin/interpreting/faqs/:id')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'faq')
  async updateFaq(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateFaqDto) {
    return this.interpretingService.updateFaq(id, body);
  }

  @Roles('admin', 'editor')
  @Patch('admin/interpreting/faqs/:id/sort')
  @ApiBearerAuth()
  async updateFaqSort(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('sortOrder') sortOrder: number,
  ) {
    return this.interpretingService.updateFaqSort(id, +sortOrder);
  }

  @Delete('admin/interpreting/faqs/:id')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('delete', 'faq')
  async deleteFaq(@Param('id', ParseUUIDPipe) id: string) {
    return this.interpretingService.deleteFaq(id);
  }

  // ── Admin: Bookings ──

  @Roles('admin', 'editor')
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

  @Roles('admin', 'editor')
  @Get('admin/bookings/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking detail (admin)' })
  async getBooking(@Param('id', ParseUUIDPipe) id: string) {
    return this.interpretingService.findBookingByIdAdmin(id);
  }

  @Roles('admin', 'editor')
  @Put('admin/bookings/:id/status')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'booking')
  @ApiOperation({ summary: 'Update booking status' })
  async updateBookingStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.interpretingService.updateBookingStatus(id, dto.status);
  }

  @Roles('admin', 'editor')
  @Patch('admin/bookings/:id/assign')
  @ApiBearerAuth()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('update', 'booking')
  async assignInterpreter(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('interpreterId') interpreterId: string,
  ) {
    return this.interpretingService.assignInterpreter(id, interpreterId);
  }
}
