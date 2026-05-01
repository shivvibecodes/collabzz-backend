import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Ip,
} from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { submitWaitlistSchema } from './dto/submit-waitlist.dto';
import { z } from 'zod';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submit(@Body() body: any, @Ip() ip: string) {
    try {
      const parsedData = submitWaitlistSchema.parse(body);
      return await this.waitlistService.create({ ...parsedData, ipAddress: ip });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException(error.issues);
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
