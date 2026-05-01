import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Ip,
  Inject,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { createContactSchema } from './dto/create-contact.dto';
import { z } from 'zod';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any, @Ip() ip: string) {
    const cacheKey = `contact_limit_${ip}`;
    const isLocked = await this.cacheManager.get(cacheKey);

    if (isLocked) {
      throw new BadRequestException(
        'Please wait a minute before sending another message.',
      );
    }

    try {
      const parsedData = createContactSchema.parse(body);
      const result = await this.contactService.create({ ...parsedData, ipAddress: ip });

      // Set a 1-minute cool-down (60,000ms)
      await this.cacheManager.set(cacheKey, true, 60000);

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException(error.issues);
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
