import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { EmailTransport } from './email.transport';
import { EmailLogService } from './email.log.service';
import { EmailLog, EmailLogSchema } from '../schemas/email-log.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: EmailLog.name, schema: EmailLogSchema },
    ]),
  ],
  providers: [EmailService, EmailProcessor, EmailTransport, EmailLogService],
  exports: [EmailService],
})
export class EmailModule {}
