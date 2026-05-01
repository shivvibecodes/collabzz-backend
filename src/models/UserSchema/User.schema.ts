import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from './User.types';
import { SocialAccounts } from './SocialAccount.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ select: false })
  passwordHash?: string;

  @Prop({ enum: Role, default: Role.Influencer, immutable: true })
  role: string;

  @Prop({ default: false })
  isProfileComplete: boolean;

  @Prop({ type: [SocialAccounts], default: [] })
  socialAccounts: SocialAccounts[];

  @Prop()
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
