import { validate } from 'class-validator';
import { UpdateProfileDto } from './update-profile.dto';

describe('UpdateProfileDto', () => {
  async function validateAvatar(avatarUrl: string) {
    const dto = new UpdateProfileDto();
    dto.avatarUrl = avatarUrl;
    return validate(dto);
  }

  it('accepts a media library avatar', async () => {
    await expect(
      validateAvatar('/uploads/avatars/profile-photo.webp'),
    ).resolves.toHaveLength(0);
  });

  it('accepts an empty avatar to clear the current image', async () => {
    await expect(validateAvatar('')).resolves.toHaveLength(0);
  });

  it('rejects an external avatar URL', async () => {
    const errors = await validateAvatar('https://example.com/avatar.png');
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isMediaLibraryPath).toContain('/uploads/');
  });

  it('accepts a valid profile email', async () => {
    const dto = new UpdateProfileDto();
    dto.email = 'traveler@example.com';
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an invalid profile email', async () => {
    const dto = new UpdateProfileDto();
    dto.email = 'not-an-email';
    const errors = await validate(dto);
    expect(errors[0].constraints?.isEmail).toBeDefined();
  });
});
