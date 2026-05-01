import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from '../../../models/UserSchema/User.schema';
import { SocialAccountsDocument } from '../../../models/UserSchema/SocialAccount.schema';
import { Providers, Role } from '../../../models/UserSchema/User.types';
import { GoogleProfile } from './google.strategy';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('SocialAccounts')
    private readonly socialAccountsModel: Model<SocialAccountsDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleGoogleLogin(profile: GoogleProfile): Promise<AuthTokens> {
    let user = await this.userModel.findOne({ email: profile.email }).exec();

    if (!user) {
      user = await this.userModel.create({
        email: profile.email,
        role: Role.Influencer,
        isProfileComplete: false,
        socialAccounts: [],
      });
      this.logger.log(`New user created via Google OAuth: ${user.email}`);
    }

    const userId = (user._id as { toString(): string }).toString();
    await this.upsertGoogleSocialAccount(userId, profile);

    return this.generateTokens(userId, user.email, user.role);
  }

  private async upsertGoogleSocialAccount(
    userId: string,
    profile: GoogleProfile,
  ): Promise<void> {
    const existing = await this.socialAccountsModel.findOne({
      provider: Providers.Google,
      providerId: profile.providerId,
    });

    if (existing) {
      existing.accessToken = profile.accessToken;
      if (profile.refreshToken) existing.refreshToken = profile.refreshToken;
      existing.profileUrl = profile.profileUrl;
      existing.handle = profile.displayName;
      await existing.save();
      return;
    }

    const socialAccount = await this.socialAccountsModel.create({
      provider: Providers.Google,
      providerId: profile.providerId,
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
      profileUrl: profile.profileUrl,
      handle: profile.displayName,
      followerCount: 0,
      isVerified: false,
    });

    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { socialAccounts: socialAccount._id },
    });
  }

  private generateTokens(
    userId: string,
    email: string,
    role: string,
  ): AuthTokens {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return { accessToken, refreshToken };
  }
}
