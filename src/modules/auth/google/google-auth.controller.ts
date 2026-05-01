import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { GoogleAuthGuard, GoogleCallbackGuard } from './google-auth.guard';
import { GoogleAuthService } from './google-auth.service';
import { GoogleProfile } from './google.strategy';
import { ConfigService } from '@nestjs/config';

@Controller('auth/google')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name);

  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(GoogleAuthGuard)
  initiateGoogleLogin(): void {}

  @Get('callback')
  @UseGuards(GoogleCallbackGuard)
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    if (!req.user) {
      this.logger.warn('Google OAuth callback: no user on request');
      return res.redirect(
        HttpStatus.FOUND,
        `${frontendUrl}/auth/error`,
      ) as unknown as void;
    }

    try {
      const profile = req.user as GoogleProfile;
      const tokens = await this.googleAuthService.handleGoogleLogin(profile);

      res.redirect(
        HttpStatus.FOUND,
        `${frontendUrl}/auth/callback` +
          `?accessToken=${tokens.accessToken}` +
          `&refreshToken=${tokens.refreshToken}`,
      );
    } catch (error) {
      this.logger.error('Google OAuth callback failed', error);
      res.redirect(HttpStatus.FOUND, `${frontendUrl}/auth/error`);
    }
  }
}
