import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Patch,
  Delete,
  Param,
  Req,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { Public } from '../../common/decorators/public.decorator';
import type { Request } from 'express';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { UsersService } from '../users/users.service';
import { UploadService } from '../upload/upload.service';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a user account' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.name,
      registerDto.email,
      registerDto.password,
    );
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google Sign-In (verifies id_token server-side)' })
  @ApiBody({ type: GoogleLoginDto })
  async google(@Body() googleLoginDto: GoogleLoginDto) {
    return this.authService.loginWithGoogle(
      googleLoginDto.credential,
      googleLoginDto.name,
    );
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@Req() request: Request) {
    const authUser = request['user'] as { sub?: string };
    return this.authService.me(authUser.sub as string);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(
    @Req() request: Request,
    @Body() dto: UpdateProfileDto,
  ) {
    const authUser = request['user'] as { sub?: string };
    return this.authService.updateMe(authUser.sub as string, dto);
  }

  @Post('me/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload an avatar image for the current user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 4 * 1024 * 1024 }, // 4MB is plenty for an avatar
    }),
  )
  async uploadAvatar(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        'Unsupported file type. Allowed: jpg, png, webp',
      );
    }
    const authUser = request['user'] as { sub?: string };
    if (!authUser?.sub) {
      throw new BadRequestException('Authentication required');
    }
    const result = await this.uploadService.storeUploadedFile(file, 'avatars');
    // Persist immediately so the next /auth/me reflects the new avatar.
    await this.authService.updateMe(authUser.sub, { avatarUrl: result.url });
    return { url: result.url };
  }

  // ── Favorites (Personal Vault) ──

  @Get('me/favorites')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user favorites' })
  async getFavorites(@Req() request: Request) {
    const authUser = request['user'] as { sub?: string };
    return this.usersService.getFavorites(authUser.sub as string);
  }

  @Post('me/favorites')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a favorite' })
  async addFavorite(
    @Req() request: Request,
    @Body() body: { targetType: string; targetId: string; targetTitle?: string; targetImage?: string },
  ) {
    const authUser = request['user'] as { sub?: string };
    const targetType = body.targetType as 'route' | 'city' | 'product';
    if (!['route', 'city', 'product'].includes(targetType)) {
      throw new BadRequestException('Invalid favorite target type');
    }
    return this.usersService.addFavorite(authUser.sub as string, {
      targetType,
      targetId: body.targetId,
      targetTitle: body.targetTitle || '',
      targetImage: body.targetImage || '',
    });
  }

  @Delete('me/favorites/:targetType/:targetId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a favorite' })
  async removeFavorite(
    @Req() request: Request,
    @Param('targetType') targetType: 'route' | 'city' | 'product',
    @Param('targetId') targetId: string,
  ) {
    const authUser = request['user'] as { sub?: string };
    if (!['route', 'city', 'product'].includes(targetType)) {
      throw new BadRequestException('Invalid favorite target type');
    }
    return this.usersService.removeFavorite(authUser.sub as string, targetType, targetId);
  }
}
