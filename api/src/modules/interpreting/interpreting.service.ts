import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ServiceMode } from './entities/service-mode.entity';
import { InterpreterProfile } from './entities/interpreter-profile.entity';
import { Faq } from './entities/faq.entity';
import { BookingSubmission } from './entities/booking-submission.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class InterpretingService {
  constructor(
    @InjectRepository(ServiceMode)
    private readonly modeRepo: Repository<ServiceMode>,
    @InjectRepository(InterpreterProfile)
    private readonly profileRepo: Repository<InterpreterProfile>,
    @InjectRepository(Faq)
    private readonly faqRepo: Repository<Faq>,
    @InjectRepository(BookingSubmission)
    private readonly bookingRepo: Repository<BookingSubmission>,
    private readonly ordersService: OrdersService,
    private readonly dataSource: DataSource,
  ) {}

  // ── Public: Full page data ──

  async getPublicPageData() {
    const [serviceModes, profiles, faqs] = await Promise.all([
      this.modeRepo.find({ order: { sortOrder: 'ASC' } }),
      this.profileRepo.find({ order: { sortOrder: 'ASC' } }),
      this.faqRepo.find({ order: { sortOrder: 'ASC' } }),
    ]);

    return { service_modes: serviceModes, profiles, faqs };
  }

  // ── Admin: Get all config ──

  async getAdminConfig() {
    return this.getPublicPageData();
  }

  async findModesAdmin(page = 1, pageSize = 20) {
    const [items, total] = await this.modeRepo.findAndCount({
      order: { sortOrder: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  async findModeByIdAdmin(id: string) {
    const mode = await this.modeRepo.findOne({ where: { id } });
    if (!mode) throw new NotFoundException('Service mode not found');
    return mode;
  }

  async createMode(data: Partial<ServiceMode>) {
    const mode = this.modeRepo.create(this.normalizeMode(data));
    return this.modeRepo.save(mode);
  }

  async updateMode(id: string, data: Partial<ServiceMode>) {
    const mode = await this.findModeByIdAdmin(id);
    Object.assign(mode, this.normalizeMode(data, mode));
    return this.modeRepo.save(mode);
  }

  async deleteMode(id: string) {
    await this.modeRepo.delete(id);
    return { deleted: true };
  }

  async updateModeSort(id: string, sortOrder: number) {
    const mode = await this.findModeByIdAdmin(id);
    mode.sortOrder = sortOrder;
    return this.modeRepo.save(mode);
  }

  async findProfilesAdmin(page = 1, pageSize = 20, status?: string) {
    const qb = this.profileRepo
      .createQueryBuilder('p')
      .orderBy('p.sortOrder', 'ASC');
    if (status) qb.andWhere('p.status = :status', { status });
    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { items, total, page, pageSize };
  }

  async findProfileByIdAdmin(id: string) {
    const profile = await this.profileRepo.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Interpreter profile not found');
    return profile;
  }

  async createProfile(data: Partial<InterpreterProfile>) {
    const profile = this.profileRepo.create(this.normalizeProfile(data));
    return this.profileRepo.save(profile);
  }

  async updateProfile(id: string, data: Partial<InterpreterProfile>) {
    const profile = await this.findProfileByIdAdmin(id);
    Object.assign(profile, this.normalizeProfile(data, profile));
    return this.profileRepo.save(profile);
  }

  async deleteProfile(id: string) {
    await this.profileRepo.delete(id);
    return { deleted: true };
  }

  async updateProfileStatus(id: string, status: string) {
    const profile = await this.findProfileByIdAdmin(id);
    profile.status = status;
    return this.profileRepo.save(profile);
  }

  async findFaqsAdmin(page = 1, pageSize = 20, category?: string) {
    const qb = this.faqRepo
      .createQueryBuilder('f')
      .orderBy('f.sortOrder', 'ASC');
    if (category) qb.andWhere('f.category = :category', { category });
    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { items, total, page, pageSize };
  }

  async findFaqByIdAdmin(id: string) {
    const faq = await this.faqRepo.findOne({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async createFaq(data: Partial<Faq>) {
    const faq = this.faqRepo.create(this.normalizeFaq(data));
    return this.faqRepo.save(faq);
  }

  async updateFaq(id: string, data: Partial<Faq>) {
    const faq = await this.findFaqByIdAdmin(id);
    Object.assign(faq, this.normalizeFaq(data, faq));
    return this.faqRepo.save(faq);
  }

  async deleteFaq(id: string) {
    await this.faqRepo.delete(id);
    return { deleted: true };
  }

  async updateFaqSort(id: string, sortOrder: number) {
    const faq = await this.findFaqByIdAdmin(id);
    faq.sortOrder = sortOrder;
    return this.faqRepo.save(faq);
  }

  // ── Admin: Full replace operations ──

  async replaceServiceModes(modes: Partial<ServiceMode>[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(ServiceMode, {});
      if (modes.length) {
        const entities = modes.map((m) =>
          queryRunner.manager.create(ServiceMode, {
            sortOrder: m.sortOrder,
            ...this.normalizeMode(m),
            accent: m.accent ?? 'light',
            featured: m.featured ?? false,
          }),
        );
        await queryRunner.manager.save(entities);
      }
      await queryRunner.commitTransaction();
      return { updated: true, count: modes.length };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async replaceProfiles(profiles: Partial<InterpreterProfile>[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(InterpreterProfile, {});
      if (profiles.length) {
        const entities = profiles.map((p) =>
          queryRunner.manager.create(InterpreterProfile, {
            sortOrder: p.sortOrder,
            ...this.normalizeProfile(p),
          }),
        );
        await queryRunner.manager.save(entities);
      }
      await queryRunner.commitTransaction();
      return { updated: true, count: profiles.length };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async replaceFaqs(faqs: Partial<Faq>[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(Faq, {});
      if (faqs.length) {
        const entities = faqs.map((f) =>
          queryRunner.manager.create(Faq, {
            sortOrder: f.sortOrder,
            ...this.normalizeFaq(f),
          }),
        );
        await queryRunner.manager.save(entities);
      }
      await queryRunner.commitTransaction();
      return { updated: true, count: faqs.length };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ── Bookings: Public submit ──

  async submitBooking(dto: CreateBookingDto) {
    const booking = this.bookingRepo.create({
      name: dto.name,
      contact: dto.contact,
      city: dto.city,
      serviceDate: dto.serviceDate,
      supportMode: dto.supportMode,
      groupSize: dto.groupSize ?? null,
      routeOrNeed: dto.routeOrNeed ?? null,
      status: 'new',
    });
    const saved = await this.bookingRepo.save(booking);
    return {
      id: saved.id,
      message: 'Booking request received. We will contact you within 24 hours.',
      created_at: saved.createdAt,
    };
  }

  async submitBookingWithDeposit(dto: CreateBookingDto) {
    const depositAmount = this.calculateDepositAmount(dto);
    const booking = this.bookingRepo.create({
      name: dto.name,
      contact: dto.contact,
      city: dto.city,
      serviceDate: dto.serviceDate,
      supportMode: dto.supportMode,
      groupSize: dto.groupSize ?? null,
      routeOrNeed: dto.routeOrNeed ?? null,
      status: 'deposit_pending',
    });

    const saved = await this.bookingRepo.save(booking);
    const depositOrder = await this.ordersService.createInterpretingDeposit({
      name: dto.name,
      contact: dto.contact,
      city: dto.city,
      serviceDate: dto.serviceDate,
      supportMode: dto.supportMode,
      groupSize: dto.groupSize ?? null,
      routeOrNeed: dto.routeOrNeed ?? null,
      depositAmount,
      currency: 'SGD',
    });

    return {
      bookingId: saved.id,
      created_at: saved.createdAt,
      status: saved.status,
      message:
        'Booking request received. Secure the interpreter slot with the deposit below.',
      deposit: {
        orderNo: depositOrder.orderNo,
        amount: depositOrder.totalAmount,
        currency: depositOrder.currency,
        status: depositOrder.status,
        paymentLabel: this.describeDeposit(dto),
        stripeClientSecret: depositOrder.stripeClientSecret,
      },
    };
  }

  async confirmBookingDeposit(id: string, orderNo: string, paymentId: string) {
    const booking = await this.findBookingByIdAdmin(id);
    const paidOrder = await this.ordersService.confirmOrder(orderNo, paymentId);
    booking.status = 'deposit_paid';
    const saved = await this.bookingRepo.save(booking);

    return {
      bookingId: saved.id,
      bookingStatus: saved.status,
      orderNo: paidOrder.orderNo,
      paymentId: paidOrder.paymentId,
      message:
        'Deposit paid. Your interpreter request is now in the matching queue.',
    };
  }

  // ── Bookings: Admin list ──

  async findBookingsAdmin(page = 1, size = 20, status?: string, q?: string) {
    const qb = this.bookingRepo
      .createQueryBuilder('b')
      .orderBy('b.createdAt', 'DESC');

    if (status) {
      qb.andWhere('b.status = :status', { status });
    }
    if (q) {
      qb.andWhere(
        '(b.name ILIKE :q OR b.contact ILIKE :q OR b.city ILIKE :q)',
        { q: `%${q}%` },
      );
    }

    const [items, total] = await qb
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return { items, total, page: +page, size: +size };
  }

  async findBookingByIdAdmin(id: string) {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async updateBookingStatus(id: string, status: string) {
    const booking = await this.findBookingByIdAdmin(id);
    booking.status = status;
    return this.bookingRepo.save(booking);
  }

  async assignInterpreter(id: string, interpreterId: string) {
    const booking = await this.findBookingByIdAdmin(id);
    const interpreter = await this.findProfileByIdAdmin(interpreterId);
    booking.assignedInterpreterId = interpreter.id;
    booking.assignedInterpreterName = this.localizedString(interpreter.name);
    if (booking.status === 'new' || booking.status === 'pending') {
      booking.status = 'confirmed';
    }
    return this.bookingRepo.save(booking);
  }

  private normalizeMode(
    data: Partial<ServiceMode>,
    fallback?: ServiceMode,
  ): Partial<ServiceMode> {
    return {
      sortOrder: data.sortOrder ?? fallback?.sortOrder ?? 0,
      title: this.i18n(data.title ?? fallback?.title),
      price: this.i18n(data.price ?? fallback?.price),
      bestFor: this.i18n(data.bestFor ?? fallback?.bestFor),
      body: this.i18n(data.body ?? fallback?.body),
      includes: this.i18nArray(data.includes ?? fallback?.includes ?? []),
      accent: data.accent ?? fallback?.accent ?? 'light',
      featured: data.featured ?? fallback?.featured ?? false,
    };
  }

  private normalizeProfile(
    data: Partial<InterpreterProfile>,
    fallback?: InterpreterProfile,
  ): Partial<InterpreterProfile> {
    return {
      sortOrder: data.sortOrder ?? fallback?.sortOrder ?? 0,
      name: this.i18n(data.name ?? fallback?.name),
      language: this.i18n(data.language ?? fallback?.language),
      focus: this.i18n(data.focus ?? fallback?.focus),
      helps: this.i18nArray(data.helps ?? fallback?.helps ?? []),
      avatar: data.avatar ?? fallback?.avatar ?? '',
      bio: this.i18n(data.bio ?? fallback?.bio),
      status: data.status ?? fallback?.status ?? 'pending_review',
      city: data.city ?? fallback?.city ?? '',
    };
  }

  private normalizeFaq(data: Partial<Faq>, fallback?: Faq): Partial<Faq> {
    return {
      sortOrder: data.sortOrder ?? fallback?.sortOrder ?? 0,
      question: this.i18n(data.question ?? fallback?.question),
      answer: this.i18n(data.answer ?? fallback?.answer),
      category: data.category ?? fallback?.category ?? 'interpreting',
    };
  }

  private i18n(value: any): { en: string; zh: string } {
    if (typeof value === 'string') return { en: value, zh: value };
    if (value && typeof value === 'object') {
      return {
        en: String(value.en ?? value.zh ?? ''),
        zh: String(value.zh ?? value.en ?? ''),
      };
    }
    return { en: '', zh: '' };
  }

  private i18nArray(value: any): { en: string; zh: string }[] {
    if (!Array.isArray(value)) return [];
    return value.map((item) => this.i18n(item));
  }

  private localizedString(value: any): string {
    if (typeof value === 'string') return value;
    return value?.zh ?? value?.en ?? '';
  }

  private calculateDepositAmount(dto: CreateBookingDto): number {
    if (dto.fastTrack) {
      return 90;
    }

    const normalized = dto.supportMode.toLowerCase();
    if (normalized.includes('group') || normalized.includes('study')) {
      return 260;
    }
    if (normalized.includes('story') || normalized.includes('route')) {
      return 180;
    }
    return 120;
  }

  private describeDeposit(dto: CreateBookingDto): string {
    if (dto.fastTrack) {
      return 'Fast Track slot deposit';
    }

    const normalized = dto.supportMode.toLowerCase();
    if (normalized.includes('group') || normalized.includes('study')) {
      return 'Group visit interpreter deposit';
    }
    if (normalized.includes('story') || normalized.includes('route')) {
      return 'Story-led route interpreter deposit';
    }
    return 'City companion interpreter deposit';
  }
}
