import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { createContactSchema } from './dto/create-contact.dto';
import { z } from 'zod';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any) {
    try {
      const parsedData = createContactSchema.parse(body);
      return await this.contactService.create(parsedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException(error);
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
