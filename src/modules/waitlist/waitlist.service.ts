import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Waitlist } from './schemas/waitlist.schema';
import { SubmitWaitlistDto } from './dto/submit-waitlist.dto';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectModel(Waitlist.name)
    private readonly waitlistModel: Model<Waitlist>,
  ) {}

  async create(data: SubmitWaitlistDto & { ipAddress: string }): Promise<Waitlist> {
    const existing = await this.waitlistModel.findOne({ email: data.email });
    if (existing) {
      throw new ConflictException('This email is already on the waitlist.');
    }
    const entry = new this.waitlistModel(data);
    return entry.save();
  }
}
