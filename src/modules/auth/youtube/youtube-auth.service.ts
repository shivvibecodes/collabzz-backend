import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from '../../../models/UserSchema/User.schema';
import { SocialAccountsDocument } from '../../../models/UserSchema/SocialAccount.schema';
import { Providers } from '../../../models/UserSchema/User.types';
import { YouTubeProfile } from './youtube.strategy';
import { AuthTokens } from '../google/google-auth.service';
import { JwtService } from '@nestjs/jwt';

interface YouTubeChannelResponse {
  items?: Array<{
    statistics?: {
      subscriberCount?: string;
    };
  }>;
}

@Injectable()
export class YouTubeAuthService {
  private readonly logger = new Logger(YouTubeAuthService.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('SocialAccounts')
    private readonly socialAccountsModel: Model<SocialAccountsDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleYouTubeLogin(
    profile: YouTubeProfile,
  ): Promise<AuthTokens | null> {
    const user = await this.userModel.findOne({ email: profile.email }).exec();

    if (!user) {
      this.logger.warn(
        `YouTube login attempted for unregistered email: ${profile.email}. Google login required first.`,
      );
      return null;
    }

    const userId = (user._id as { toString(): string }).toString();
    const subscriberCount = await this.fetchSubscriberCount(
      profile.accessToken,
    );
    await this.upsertYouTubeSocialAccount(userId, profile, subscriberCount);

    return this.generateTokens(userId, user.email, user.role);
  }

  private async fetchSubscriberCount(accessToken: string): Promise<number> {
    try {
      const res = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const data = (await res.json()) as YouTubeChannelResponse;
      const count = data?.items?.[0]?.statistics?.subscriberCount;
      return count ? parseInt(count, 10) : 0;
    } catch (err) {
      this.logger.error('Failed to fetch YouTube subscriber count', err);
      return 0;
    }
  }

  private async upsertYouTubeSocialAccount(
    userId: string,
    profile: YouTubeProfile,
    subscriberCount: number,
  ): Promise<void> {
    const existing = await this.socialAccountsModel.findOne({
      provider: Providers.Youtube,
      providerId: profile.providerId,
    });

    if (existing) {
      existing.accessToken = profile.accessToken;
      if (profile.refreshToken) existing.refreshToken = profile.refreshToken;
      existing.profileUrl = profile.profileUrl;
      existing.handle = profile.displayName;
      existing.followerCount = subscriberCount;
      await existing.save();
      this.logger.log(
        `YouTube account updated for user ${userId}, subscribers: ${subscriberCount}`,
      );
      return;
    }

    const socialAccount = await this.socialAccountsModel.create({
      provider: Providers.Youtube,
      providerId: profile.providerId,
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
      profileUrl: profile.profileUrl,
      handle: profile.displayName,
      followerCount: subscriberCount,
      isVerified: false,
    });

    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { socialAccounts: socialAccount._id },
    });

    this.logger.log(
      `YouTube account linked for user ${userId}, subscribers: ${subscriberCount}`,
    );
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
