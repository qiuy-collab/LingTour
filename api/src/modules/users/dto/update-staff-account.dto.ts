import { PartialType } from '@nestjs/swagger';
import { CreateStaffAccountDto } from './create-staff-account.dto';

export class UpdateStaffAccountDto extends PartialType(CreateStaffAccountDto) {}
