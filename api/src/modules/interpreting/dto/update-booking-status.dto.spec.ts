import { validate } from 'class-validator';
import { UpdateBookingStatusDto } from './update-booking-status.dto';

describe('UpdateBookingStatusDto', () => {
  async function validateStatus(status: string) {
    const dto = new UpdateBookingStatusDto();
    dto.status = status;
    return validate(dto);
  }

  it('accepts completed for the admin complete-booking action', async () => {
    await expect(validateStatus('completed')).resolves.toHaveLength(0);
  });

  it('rejects unknown booking statuses', async () => {
    await expect(validateStatus('archived')).resolves.not.toHaveLength(0);
  });
});
