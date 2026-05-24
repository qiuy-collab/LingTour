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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { Public } from '../../common/decorators/public.decorator';
import type { Request } from 'express';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
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
