import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { CreateOrderDto } from './create-order.dto';

const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
});

const payload = {
  guestEmail: 'guest@example.com',
  items: [{ productId: '11111111-1111-4111-8111-111111111111', quantity: 1 }],
  shippingAddress: {
    recipientName: 'Guest',
    street: '1 Main Street',
    city: 'Singapore',
    state: 'Singapore',
    postalCode: '123456',
    country: 'Singapore',
  },
};

describe('CreateOrderDto', () => {
  it('accepts product identity and quantity without a client price', async () => {
    const result = (await pipe.transform(payload, {
      type: 'body',
      metatype: CreateOrderDto,
      data: '',
    })) as CreateOrderDto;

    expect(result.items).toEqual([
      { productId: '11111111-1111-4111-8111-111111111111', quantity: 1 },
    ]);
  });

  it('rejects a caller-supplied user id on the public checkout', async () => {
    await expect(
      pipe.transform(
        {
          ...payload,
          userId: '22222222-2222-4222-8222-222222222222',
        },
        { type: 'body', metatype: CreateOrderDto, data: '' },
      ),
    ).rejects.toThrow();
  });

  it('rejects a caller-supplied unit price', async () => {
    await expect(
      pipe.transform(
        {
          ...payload,
          items: [{ ...payload.items[0], unitPrice: 0.01 }],
        },
        { type: 'body', metatype: CreateOrderDto, data: '' },
      ),
    ).rejects.toThrow();
  });
});
