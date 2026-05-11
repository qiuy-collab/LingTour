import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceMode } from './entities/service-mode.entity';
import { InterpreterProfile } from './entities/interpreter-profile.entity';
import { Faq } from './entities/faq.entity';
import { BookingSubmission } from './entities/booking-submission.entity';
import { InterpretingService } from './interpreting.service';
import { InterpretingController } from './interpreting.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceMode,
      InterpreterProfile,
      Faq,
      BookingSubmission,
    ]),
  ],
  controllers: [InterpretingController],
  providers: [InterpretingService],
  exports: [InterpretingService],
})
export class InterpretingModule {}
