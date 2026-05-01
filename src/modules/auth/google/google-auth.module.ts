import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { GoogleStrategy } from './google.strategy';
import { GoogleAuthGuard, GoogleCallbackGuard } from './google-auth.guard';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthController } from './google-auth.controller';

import { UserSchema } from '../../../models/UserSchema/User.schema';
import { SocialAccounts, SocialAccountsSchema } from '../../../models/UserSchema/SocialAccount.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'google' }),
    JwtModule.register({}), // Secrets passed per-sign via ConfigService
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'SocialAccounts', schema: SocialAccountsSchema },
    ]),
  ],
  controllers: [GoogleAuthController],
  providers: [
    GoogleStrategy,
    GoogleAuthService,
    GoogleAuthGuard,
    GoogleCallbackGuard,
  ],
  exports: [GoogleAuthService],
})
export class GoogleAuthModule {}
