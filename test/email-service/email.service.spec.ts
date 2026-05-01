import { EmailService } from '../../src/modules/email/email.service';
import { EmailLogService } from '../../src/modules/email/email.log.service';
import { createMock } from '@golevelup/ts-jest';
import { Queue } from 'bullmq';

describe('EmailService', () => {
  let service: EmailService;
  let addMock: jest.Mock;
  let createFailedMock: jest.Mock;

  beforeEach(() => {
    addMock = jest.fn().mockResolvedValue({ id: 'job-123' });
    createFailedMock = jest.fn().mockResolvedValue({});

    const queue = createMock<Queue>({ add: addMock });
    const logService = createMock<EmailLogService>({
      createFailed: createFailedMock,
    });

    service = new EmailService(queue, logService);
  });

  it('sendOtp queues job with type=otp and correct retry config', async () => {
    await service.sendOtp({
      to: 'user@test.com',
      name: 'Alice',
      otp: '123456',
      expiresInMinutes: 10,
    });

    const addCall = addMock.mock.calls[0] as [string, unknown, unknown];
    expect(addCall[0]).toBe('send');
    expect(addCall[1]).toEqual(
      expect.objectContaining({ type: 'otp', to: 'user@test.com' }),
    );
    expect(addCall[2]).toEqual(
      expect.objectContaining({
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      }),
    );
  });

  it('sendWelcome queues job with type=welcome', async () => {
    await service.sendWelcome({
      to: 'brand@test.com',
      name: 'Brand Corp',
      role: 'brand',
    });

    const addCall = addMock.mock.calls[0] as [string, unknown, unknown];
    expect(addCall[0]).toBe('send');
    expect(addCall[1]).toEqual(
      expect.objectContaining({
        type: 'welcome',
        to: 'brand@test.com',
        role: 'brand',
      }),
    );
  });

  it('sendDealNotification queues job with type=deal-notification', async () => {
    await service.sendDealNotification({
      to: 'influencer@test.com',
      name: 'Influencer',
      dealTitle: 'Summer Campaign',
      dealAmount: 5000,
      brandName: 'Nike',
      actionUrl: 'https://app.collabzz.com/deals/1',
    });

    const addCall = addMock.mock.calls[0] as [string, unknown, unknown];
    expect(addCall[1]).toEqual(
      expect.objectContaining({
        type: 'deal-notification',
        dealTitle: 'Summer Campaign',
      }),
    );
  });

  it('sendPaymentReceipt queues job with type=payment-receipt', async () => {
    await service.sendPaymentReceipt({
      to: 'user@test.com',
      name: 'Alice',
      amount: 250,
      currency: 'USD',
      transactionId: 'txn-abc123',
      description: 'Deal payment',
      paidAt: new Date('2024-01-15'),
    });

    const addCall = addMock.mock.calls[0] as [string, unknown, unknown];
    expect(addCall[1]).toEqual(
      expect.objectContaining({
        type: 'payment-receipt',
        transactionId: 'txn-abc123',
      }),
    );
  });

  it('sendContractReminder queues job with type=contract-reminder', async () => {
    await service.sendContractReminder({
      to: 'user@test.com',
      name: 'Alice',
      contractTitle: 'Q1 Deal',
      dueDate: '2024-03-31',
      actionUrl: 'https://app.collabzz.com/contracts/1',
    });

    const addCall = addMock.mock.calls[0] as [string, unknown, unknown];
    expect(addCall[1]).toEqual(
      expect.objectContaining({
        type: 'contract-reminder',
        contractTitle: 'Q1 Deal',
      }),
    );
  });

  it('logs failure and rethrows when Redis/queue throws', async () => {
    addMock.mockRejectedValue(new Error('Redis connection refused'));

    await expect(
      service.sendWelcome({ to: 'x@y.com', name: 'Bob', role: 'brand' }),
    ).rejects.toThrow('Redis connection refused');

    expect(createFailedMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'welcome', to: 'x@y.com' }),
      'Redis connection refused',
    );
  });

  it('scheduleEmail passes delay option to queue', async () => {
    await service.scheduleEmail(
      {
        type: 'otp',
        to: 'a@b.com',
        name: 'Test',
        otp: '000',
        expiresInMinutes: 5,
      },
      120_000,
    );

    const addCall = addMock.mock.calls[0] as [string, unknown, unknown];
    expect(addCall[2]).toEqual(expect.objectContaining({ delay: 120_000 }));
  });

  it('scheduleEmail logs failure and rethrows on queue error', async () => {
    addMock.mockRejectedValue(new Error('Queue full'));

    await expect(
      service.scheduleEmail(
        {
          type: 'otp',
          to: 'a@b.com',
          name: 'Test',
          otp: '000',
          expiresInMinutes: 5,
        },
        5000,
      ),
    ).rejects.toThrow('Queue full');

    expect(createFailedMock).toHaveBeenCalled();
  });
});
