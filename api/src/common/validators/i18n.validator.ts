import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'isI18nObject', async: false })
export class IsI18nObjectConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value !== 'object') {
      return false;
    }
    const keys = Object.keys(value);
    // Must have 'en' string and 'zh' string
    if (!keys.includes('en') || !keys.includes('zh')) {
      return false;
    }
    return typeof value.en === 'string' && typeof value.zh === 'string';
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be an i18n object with { en: string, zh: string } format`;
  }
}

export function IsI18nObject(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsI18nObjectConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isI18nArray', async: false })
export class IsI18nArrayConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!Array.isArray(value)) {
      return false;
    }
    const validator = new IsI18nObjectConstraint();
    return value.every((item) => validator.validate(item));
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be an array of i18n objects { en: string, zh: string }`;
  }
}

export function IsI18nArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsI18nArrayConstraint,
    });
  };
}
