import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceMode } from './entities/service-mode.entity';
import { InterpreterProfile } from './entities/interpreter-profile.entity';
import { Faq } from './entities/faq.entity';
import { BookingSubmission } from './entities/booking-submission.entity';
import { InterpretingService } from './interpreting.service';
import { InterpretingController } from './interpreting.controller';
import { OrdersModule } from '../orders/orders.module';
import { TravelerBookingsController } from './traveler-bookings.controller';
import { TravelerBookingsService } from './traveler-bookings.service';

@Module({
  imports: [
    OrdersModule,
    TypeOrmModule.forFeature([
      ServiceMode,
      InterpreterProfile,
      Faq,
      BookingSubmission,
    ]),
  ],
  controllers: [InterpretingController, TravelerBookingsController],
  providers: [InterpretingService, TravelerBookingsService],
  exports: [InterpretingService],
})
export class InterpretingModule {}
