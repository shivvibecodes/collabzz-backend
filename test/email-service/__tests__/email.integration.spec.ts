import * as dotenv from 'dotenv';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getQueueToken } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailModule } from '../../../src/modules/email/email.module';
import { EmailProcessor } from '../../../src/modules/email/email.processor';
import { EMAIL_QUEUE } from '../../../src/modules/email/email.constants';
import { EmailJobPayload } from '../../../src/modules/dto/send-email.dto';

dotenv.config({ path: '.env.test' });

const RECIPIENT = process.env.TEST_RECIPIENT_EMAIL ?? 'fallback@example.com';

describe('EmailModule (integration) — real emails → your Gmail', () => {
  let module: TestingModule;
  let processor: EmailProcessor;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI_TEST!),
        EmailModule,
      ],
    })
      .overrideProvider(getQueueToken(EMAIL_QUEUE))
      .useValue({
        add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
      })
      .compile();

    processor = module.get(EmailProcessor);
  }, 60_000);

  afterAll(async () => {
    await module.close();
  }, 15_000);

  function makeJob(data: EmailJobPayload): Job<EmailJobPayload> {
    return {
      id: `test-${Date.now()}`,
      data,
      attemptsMade: 0,
    } as unknown as Job<EmailJobPayload>;
  }

  it('sends OTP email → check your Gmail inbox', async () => {
    console.log(`\n📧 Sending OTP email to: ${RECIPIENT}`);
    await expect(
      processor.process(
        makeJob({
          type: 'otp',
          to: RECIPIENT,
          name: 'Test User',
          otp: '847261',
          expiresInMinutes: 10,
        }),
      ),
    ).resolves.not.toThrow();
    console.log('✅ OTP email sent via Brevo — check your Gmail');
  }, 15_000);

  it('sends Welcome email → check your Gmail inbox', async () => {
    console.log(`\n📧 Sending Welcome email to: ${RECIPIENT}`);
    await expect(
      processor.process(
        makeJob({
          type: 'welcome',
          to: RECIPIENT,
          name: 'Test User',
          role: 'brand',
        }),
      ),
    ).resolves.not.toThrow();
    console.log('✅ Welcome email sent via Brevo — check your Gmail');
  }, 15_000);

  it('sends Deal Notification email → check your Gmail inbox', async () => {
    console.log(`\n📧 Sending Deal Notification to: ${RECIPIENT}`);
    await expect(
      processor.process(
        makeJob({
          type: 'deal-notification',
          to: RECIPIENT,
          name: 'Test User',
          dealTitle: 'Summer Campaign 2026',
          dealAmount: 5000,
          brandName: 'Nike',
          actionUrl: 'https://app.collabzz.com/deals/test-123',
        }),
      ),
    ).resolves.not.toThrow();
    console.log('✅ Deal notification sent via Brevo — check your Gmail');
  }, 15_000);

  it('sends Payment Receipt email → check your Gmail inbox', async () => {
    console.log(`\n📧 Sending Payment Receipt to: ${RECIPIENT}`);
    await expect(
      processor.process(
        makeJob({
          type: 'payment-receipt',
          to: RECIPIENT,
          name: 'Test User',
          amount: 2500,
          currency: 'USD',
          transactionId: 'txn-integration-test-001',
          description: 'Integration test payment',
          paidAt: new Date().toISOString(),
        }),
      ),
    ).resolves.not.toThrow();
    console.log('✅ Payment receipt sent via Brevo — check your Gmail');
  }, 15_000);

  it('sends Contract Reminder email → check your Gmail inbox', async () => {
    console.log(`\n📧 Sending Contract Reminder to: ${RECIPIENT}`);
    await expect(
      processor.process(
        makeJob({
          type: 'contract-reminder',
          to: RECIPIENT,
          name: 'Test User',
          contractTitle: 'Q2 2026 Influencer Agreement',
          dueDate: '2026-04-01',
          actionUrl: 'https://app.collabzz.com/contracts/test-456',
        }),
      ),
    ).resolves.not.toThrow();
    console.log('✅ Contract reminder sent via Brevo — check your Gmail');
  }, 15_000);
});
