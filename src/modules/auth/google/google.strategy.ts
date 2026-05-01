import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { Providers } from '../../../models/UserSchema/User.types';

export interface GoogleProfile {
  provider: Providers.Google;
  providerId: string;
  email: string;
  displayName: string;
  profileUrl: string;
  accessToken: string;
  refreshToken: string | undefined;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
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

    const googleProfile: GoogleProfile = {
      provider: Providers.Google,
      providerId: id,
      email: emails![0].value,
      displayName,
      profileUrl: photos?.[0]?.value ?? '',
      accessToken,
      refreshToken,
    };

    done(null, googleProfile);
  }
}
