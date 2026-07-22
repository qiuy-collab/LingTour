import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

const MEDIA_LIBRARY_PATH =
  /^\/uploads\/(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9][A-Za-z0-9._-]*$/;
const MEDIA_FIELD_NAMES = new Set([
  'avatar',
  'breathImage',
  'ctaImage',
  'heroImage',
  'image',
  'interpretingImage',
  'poster',
  'url',
]);

export function isMediaLibraryPath(value: unknown): value is string {
  return typeof value === 'string' && MEDIA_LIBRARY_PATH.test(value.trim());
}

export function containsOnlyMediaLibraryPaths(value: unknown): boolean {
  if (value == null || value === '') return true;
  if (Array.isArray(value)) {
    return value.every((item) => containsOnlyMediaLibraryPaths(item));
  }
  if (typeof value !== 'object') return true;

  return Object.entries(value as Record<string, unknown>).every(
    ([key, item]) => {
      if (
        MEDIA_FIELD_NAMES.has(key) &&
        typeof item === 'string' &&
        item.trim()
      ) {
        return isMediaLibraryPath(item);
      }
      return containsOnlyMediaLibraryPaths(item);
    },
  );
}

export function IsMediaLibraryPath(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isMediaLibraryPath',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return value === '' || isMediaLibraryPath(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must reference a file under /uploads/`;
        },
      },
    });
  };
}

export function ContainsOnlyMediaLibraryPaths(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'containsOnlyMediaLibraryPaths',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return containsOnlyMediaLibraryPaths(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} contains media that is not stored in the media library`;
        },
      },
    });
  };
}
