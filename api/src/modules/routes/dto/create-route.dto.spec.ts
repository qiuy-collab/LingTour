import { ValidationPipe } from '@nestjs/common';
import { CreateStopDto } from './create-route.dto';

const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
});

const stop = {
  sortOrder: 0,
  time: '08:00',
  stopName: { en: 'Huguangyan', zh: '湖光岩' },
  story: { en: 'A volcanic crater lake.', zh: '' },
  culturalStory: { en: 'Geological heritage.', zh: '' },
  image: '/uploads/seed/route-huguangyan.jpg',
};

describe('Route featured stop validation', () => {
  it.each([true, false])('preserves the explicit boolean %s', async (isFeatured) => {
    const result = await pipe.transform({ ...stop, isFeatured }, { type: 'body', metatype: CreateStopDto });
    expect(result.isFeatured).toBe(isFeatured);
  });

  it.each(['false', 'true', 0, 1, {}])('rejects nonboolean %p', async (isFeatured) => {
    await expect(pipe.transform({ ...stop, isFeatured }, { type: 'body', metatype: CreateStopDto })).rejects.toThrow();
  });

  it('preserves missing geographic coordinates as null', async () => {
    const result = await pipe.transform({ ...stop, lat: null, lng: 110.277 }, { type: 'body', metatype: CreateStopDto });
    expect(result.lat).toBeNull();
    expect(result.lng).toBe(110.277);
  });
});
