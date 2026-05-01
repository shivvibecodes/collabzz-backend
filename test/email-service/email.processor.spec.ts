import { EmailProcessor } from '../../src/modules/email/email.processor';
import { EmailTransport } from '../../src/modules/email/email.transport';
import { EmailLogService } from '../../src/modules/email/email.log.service';
import { createMock } from '@golevelup/ts-jest';
import { Job } from 'bullmq';
import { EmailJobPayload } from '../../src/modules/dto/send-email.dto';

describe('EmailProcessor', () => {
  let processor: EmailProcessor;

  const fakeLog = { _id: '507f1f77bcf86cd799439011' };

  let sendMock: jest.Mock;
  let upsertPendingMock: jest.Mock;
  let markSentMock: jest.Mock;
  let markFailedMock: jest.Mock;
  let createFailedMock: jest.Mock;

  beforeEach(() => {
    sendMock = jest.fn().mockResolvedValue({ messageId: '<msg123@brevo>' });
    upsertPendingMock = jest.fn().mockResolvedValue(fakeLog);
    markSentMock = jest.fn().mockResolvedValue(undefined);
    markFailedMock = jest.fn().mockResolvedValue(undefined);
    createFailedMock = jest.fn().mockResolvedValue({});

    const transport = createMock<EmailTransport>({ send: sendMock });
    const logService = createMock<EmailLogService>({
      upsertPending: upsertPendingMock,
      markSent: markSentMock,
      markFailed: markFailedMock,
      createFailed: createFailedMock,
    });

    processor = new EmailProcessor(transport, logService);
  });

  const makeJob = (data: EmailJobPayload): Job<EmailJobPayload> =>
    ({ id: 'job-1', data, attemptsMade: 0 }) as unknown as Job<EmailJobPayload>;

  it('processes OTP email — calls transport and marks log sent', async () => {
    const job = makeJob({
      type: 'otp',
      to: 'user@test.com',
      name: 'Alice',
      otp: '654321',
      expiresInMinutes: 10,
    });

    await processor.process(job);

    const sendCalls = sendMock.mock.calls as [Record<string, unknown>][];
    expect(sendCalls[0][0]).toEqual(
      expect.objectContaining({ to: 'user@test.com' }),
    );
    expect(markSentMock).toHaveBeenCalledWith(
      String(fakeLog._id),
      '<msg123@brevo>',
    );
    expect(markFailedMock).not.toHaveBeenCalled();
  });

  it('processes welcome email successfully', async () => {
    const job = makeJob({
      type: 'welcome',
      to: 'w@test.com',
      name: 'Bob',
      role: 'influencer',
    });

    await processor.process(job);

    expect(sendMock).toHaveBeenCalled();
    expect(markSentMock).toHaveBeenCalledWith(
      String(fakeLog._id),
      '<msg123@brevo>',
    );
  });

  it('processes deal-notification email successfully', async () => {
    const job = makeJob({
      type: 'deal-notification',
      to: 'd@test.com',
      name: 'Carol',
      dealTitle: 'Summer Deal',
      dealAmount: 1000,
      brandName: 'Adidas',
      actionUrl: 'https://app.collabzz.com/deals/99',
    });

    await processor.process(job);

    expect(sendMock).toHaveBeenCalled();
    expect(markSentMock).toHaveBeenCalled();
  });

  it('marks log failed and rethrows when transport throws Error', async () => {
    sendMock.mockRejectedValue(new Error('Network timeout'));

    const job = makeJob({
      type: 'otp',
      to: 'user@test.com',
      name: 'Alice',
      otp: '000000',
      expiresInMinutes: 5,
    });

    await expect(processor.process(job)).rejects.toThrow('Network timeout');

    expect(markFailedMock).toHaveBeenCalledWith(
      String(fakeLog._id),
      'Network timeout',
    );
    expect(markSentMock).not.toHaveBeenCalled();
  });

  it('marks log failed and rethrows when transport throws Brevo error object', async () => {
    sendMock.mockRejectedValue({
      response: { data: { message: 'Daily quota exceeded' }, status: 429 },
      message: 'Request failed',
    });

    const job = makeJob({
      type: 'otp',
      to: 'x@y.com',
      name: 'Test',
      otp: '111',
      expiresInMinutes: 5,
    });

    await expect(processor.process(job)).rejects.toBeTruthy();

    expect(markFailedMock).toHaveBeenCalledWith(
      String(fakeLog._id),
      'Daily quota exceeded',
    );
  });

  it('does NOT throw and logs failure on unknown email type (no BullMQ retry)', async () => {
    const job = {
      id: 'job-1',
      data: { type: 'mystery-type', to: 'x@y.com' },
      attemptsMade: 0,
    } as unknown as Job<EmailJobPayload>;

    await expect(processor.process(job)).resolves.toBeUndefined();

    expect(createFailedMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'mystery-type' }),
      expect.stringContaining('Unknown email type'),
    );
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('calls upsertPending with the job id before sending', async () => {
    const job = makeJob({
      type: 'otp',
      to: 'p@test.com',
      name: 'Pending',
      otp: '123',
      expiresInMinutes: 5,
    });

    await processor.process(job);

    expect(upsertPendingMock).toHaveBeenCalledWith(
      'job-1',
      expect.objectContaining({ type: 'otp', to: 'p@test.com' }),
      expect.any(String),
    );
  });
});
