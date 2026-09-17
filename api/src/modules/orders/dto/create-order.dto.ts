import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsEmail,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ example: 'uuid-of-product' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;
}

export class ShippingAddressDto {
  @ApiProperty({ example: 'John Smith' })
  @IsString()
  @MaxLength(200)
  recipientName: string;

  @ApiProperty({ example: '123 Main Street, Apt 4' })
  @IsString()
  @MaxLength(500)
  street: string;

  @ApiProperty({ example: 'Singapore' })
  @IsString()
  @MaxLength(200)
  city: string;

  @ApiProperty({ example: 'Singapore' })
  @IsString()
  @MaxLength(200)
  state: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MaxLength(20)
  postalCode: string;

  @ApiProperty({ example: 'Singapore' })
  @IsString()
  @MaxLength(100)
  country: string;

  @ApiPropertyOptional({ example: '+65 9123 4567' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Contact email for checkout' })
  @IsEmail()
  guestEmail: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiPropertyOptional({ default: 'paypal', enum: ['paypal'] })
  @IsOptional()
  @IsString()
  @IsIn(['paypal'])
  paymentMethod?: string;
}
