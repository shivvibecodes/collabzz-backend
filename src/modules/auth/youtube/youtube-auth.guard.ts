import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class YouTubeAuthGuard extends AuthGuard('youtube') {}

@Injectable()
export class YouTubeCallbackGuard extends AuthGuard('youtube') {
  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err || !user) return null as unknown as TUser;
    return user as TUser;
  }
}
