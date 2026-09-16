import { validate } from 'class-validator';
import { CreateEventDto } from './create-event.dto';

describe('CreateEventDto status', () => {
  it('accepts the supported event statuses', async () => {
    for (const status of ['draft', 'upcoming', 'ongoing', 'past']) {
      const dto = Object.assign(new CreateEventDto(), {
        slug: 'sample-event',
        title: 'Sample',
        date: '2026-09-16',
        status,
      });
      await expect(validate(dto)).resolves.toEqual([]);
    }
  });

  it('rejects arbitrary statuses', async () => {
    const dto = Object.assign(new CreateEventDto(), {
      slug: 'sample-event',
      title: 'Sample',
      date: '2026-09-16',
      status: 'broken',
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'status')).toBe(true);
  });
});
