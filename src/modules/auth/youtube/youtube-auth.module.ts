import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { YouTubeStrategy } from './youtube.strategy';
import { YouTubeAuthGuard, YouTubeCallbackGuard } from './youtube-auth.guard';
import { YouTubeAuthService } from './youtube-auth.service';
import { YouTubeAuthController } from './youtube-auth.controller';

import { UserSchema } from '../../../models/UserSchema/User.schema';
import { SocialAccounts, SocialAccountsSchema } from '../../../models/UserSchema/SocialAccount.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'youtube' }),
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'SocialAccounts', schema: SocialAccountsSchema },
    ]),
  ],
  controllers: [YouTubeAuthController],
  providers: [
    YouTubeStrategy,
    YouTubeAuthService,
    YouTubeAuthGuard,
    YouTubeCallbackGuard,
  ],
  exports: [YouTubeAuthService],
})
export class YouTubeAuthModule {}
