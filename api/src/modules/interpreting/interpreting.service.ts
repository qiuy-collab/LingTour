import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ServiceMode } from './entities/service-mode.entity';
import { InterpreterProfile } from './entities/interpreter-profile.entity';
import { Faq } from './entities/faq.entity';
import { BookingSubmission } from './entities/booking-submission.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

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
            title: m.title,
            price: m.price,
            bestFor: m.bestFor,
            body: m.body,
            includes: m.includes ?? [],
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
            name: p.name,
            language: p.language,
            focus: p.focus,
            helps: p.helps ?? [],
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
            question: f.question,
            answer: f.answer,
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
}
