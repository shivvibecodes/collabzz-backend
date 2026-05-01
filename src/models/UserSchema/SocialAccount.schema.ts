import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Providers } from './User.types';
import { decrypt, encrypt } from './Encryption';

export type SocialAccountsDocument = HydratedDocument<SocialAccounts>;

@Schema()
export class SocialAccounts {
  @Prop({ enum: Providers })
  provider: string;

  @Prop()
  providerId: string;

  @Prop({
    type: String,
    set: (val: string) => encrypt(val),
    get: (val: string) => decrypt(val),
  })
  accessToken: string;

  @Prop({
    type: String,
    set: (val: string) => encrypt(val),
    get: (val: string) => decrypt(val),
  })
  refreshToken: string;

  @Prop()
  profileUrl: string;

  @Prop()
  handle: string;

  @Prop()
  followerCount: number;

  @Prop()
  isVerified: boolean;
}

export const SocialAccountsSchema = SchemaFactory.createForClass(SocialAccounts);
