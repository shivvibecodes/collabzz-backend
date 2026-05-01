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
import { YouTubeAuthGuard, YouTubeCallbackGuard } from './youtube-auth.guard';
import { YouTubeAuthService } from './youtube-auth.service';
import { YouTubeProfile } from './youtube.strategy';
import { ConfigService } from '@nestjs/config';

@Controller('auth/youtube')
export class YouTubeAuthController {
  private readonly logger = new Logger(YouTubeAuthController.name);

  constructor(
    private readonly youtubeAuthService: YouTubeAuthService,
    private readonly configService: ConfigService,
  ) {}

  /** GET /auth/youtube — initiates YouTube OAuth2 flow */
  @Get()
  @UseGuards(YouTubeAuthGuard)
  initiateYouTubeLogin(): void {}

  /** GET /auth/youtube/callback — Google redirects here after consent */
  @Get('callback')
  @UseGuards(YouTubeCallbackGuard)
  async youtubeCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    if (!req.user) {
      this.logger.warn('YouTube OAuth callback: no user on request');
      res.redirect(HttpStatus.FOUND, `${frontendUrl}/auth/error`);
      return;
    }

    try {
      const profile = req.user as YouTubeProfile;
      const tokens = await this.youtubeAuthService.handleYouTubeLogin(profile);

      if (!tokens) {
        // User not found — Google login hasn't happened yet
        this.logger.warn(
          `YouTube login failed: no existing user for ${profile.email}`,
        );
        res.redirect(
          HttpStatus.FOUND,
          `${frontendUrl}/auth/error?reason=google_login_required`,
        );
        return;
      }

      res.redirect(
        HttpStatus.FOUND,
        `${frontendUrl}/auth/callback` +
          `?accessToken=${tokens.accessToken}` +
          `&refreshToken=${tokens.refreshToken}`,
      );
    } catch (error) {
      this.logger.error('YouTube OAuth callback failed', error);
      res.redirect(HttpStatus.FOUND, `${frontendUrl}/auth/error`);
    }
  }
}
