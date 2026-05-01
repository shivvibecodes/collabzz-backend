import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleAuthModule } from './google';
import { YouTubeAuthModule } from './youtube';

@Module({
  imports: [GoogleAuthModule, YouTubeAuthModule],
  controllers: [AuthController],
})
export class AuthModule { }
