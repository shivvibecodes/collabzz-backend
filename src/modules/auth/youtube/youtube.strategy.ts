import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { Providers } from '../../../models/UserSchema/User.types';

export interface YouTubeProfile {
  provider: Providers.Youtube;
  providerId: string;
  email: string;
  displayName: string;
  profileUrl: string;
  accessToken: string;
  refreshToken: string | undefined;
}

@Injectable()
export class YouTubeStrategy extends PassportStrategy(Strategy, 'youtube') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('YOUTUBE_CALLBACK_URL'),
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/youtube.readonly',
      ],
    });
  }

  authorizationParams(): Record<string, string> {
    return {
      access_type: 'offline',
      prompt: 'consent',
    };
  }

  validate(
    accessToken: string,
    refreshToken: string | undefined,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const { id, emails, photos, displayName } = profile;

    const youtubeProfile: YouTubeProfile = {
      provider: Providers.Youtube,
      providerId: id,
      email: emails![0].value,
      displayName,
      profileUrl: photos?.[0]?.value ?? '',
      accessToken,
      refreshToken,
    };

    done(null, youtubeProfile);
  }
}
