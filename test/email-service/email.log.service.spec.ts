/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { EmailLogService } from '../../src/modules/email/email.log.service';
import {
  EmailLog,
  EmailLogDocument,
  EmailStatus,
} from '../../src/modules/schemas/email-log.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

const mockSave = jest.fn();
const mockFindOneAndUpdate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFind = jest.fn();
const mockCountDocuments = jest.fn();

function MockEmailLogModel(data: Record<string, unknown>) {
  return { ...data, save: mockSave } as unknown as EmailLogDocument;
}
MockEmailLogModel.findOneAndUpdate = mockFindOneAndUpdate;
MockEmailLogModel.findByIdAndUpdate = mockFindByIdAndUpdate;
MockEmailLogModel.find = mockFind;
MockEmailLogModel.countDocuments = mockCountDocuments;

describe('EmailLogService', () => {
  let service: EmailLogService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailLogService,
        {
          provide: getModelToken(EmailLog.name),
          useValue: MockEmailLogModel,
        },
      ],
    }).compile();

    service = module.get<EmailLogService>(EmailLogService);
  });

  it('createPending saves a log with status=pending', async () => {
    const fakeDoc = { _id: 'log-1', status: EmailStatus.Pending };
    mockSave.mockResolvedValue(fakeDoc);

    const result = await service.createPending(
      {
        type: 'otp',
        to: 'a@b.com',
        name: 'Alice',
        otp: '123',
        expiresInMinutes: 5,
      },
      'Your OTP code',
    );

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(result).toEqual(fakeDoc);
  });

  it('upsertPending calls findOneAndUpdate with upsert=true', async () => {
    const fakeDoc = { _id: 'log-2', jobId: 'job-abc' };
    mockFindOneAndUpdate.mockResolvedValue(fakeDoc);

    const result = await service.upsertPending(
      'job-abc',
      { type: 'welcome', to: 'b@c.com', name: 'Bob', role: 'brand' },
      'Welcome to Collabzz',
    );

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { jobId: 'job-abc' },
      expect.objectContaining({
        $set: expect.objectContaining({ status: EmailStatus.Pending }),
        $setOnInsert: { jobId: 'job-abc' },
      }),
      { upsert: true, new: true },
    );
    expect(result).toEqual(fakeDoc);
  });

  it('createFailed saves a log with status=failed and errorMessage', async () => {
    const fakeDoc = { _id: 'log-3', status: EmailStatus.Failed };

    mockSave.mockResolvedValue(fakeDoc);

    const result = await service.createFailed(
      {
        type: 'otp',
        to: 'c@d.com',
        name: 'Carol',
        otp: '999',
        expiresInMinutes: 5,
      },
      'Template resolution failed',
    );

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(result).toEqual(fakeDoc);
  });

  it('markSent calls findByIdAndUpdate with status=sent and messageId', async () => {
    mockFindByIdAndUpdate.mockResolvedValue({});

    await service.markSent('log-id-1', '<msg@brevo>');

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('log-id-1', {
      status: EmailStatus.Sent,
      messageId: '<msg@brevo>',
      sentAt: Date.now(),
    });
  });

  it('markFailed calls findByIdAndUpdate with status=failed and errorMessage', async () => {
    mockFindByIdAndUpdate.mockResolvedValue({});

    await service.markFailed('log-id-2', 'Brevo rate limit');

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('log-id-2', {
      status: EmailStatus.Failed,
      errorMessage: 'Brevo rate limit',
    });
  });

  it('findAll returns paginated data and total count', async () => {
    const fakeDocs: { _id: string }[] = [{ _id: 'a' }, { _id: 'b' }];

    const execFind = jest
      .fn<Promise<{ _id: string }[]>, []>()
      .mockResolvedValue(fakeDocs);
    const limitMock: jest.Mock = jest.fn().mockReturnValue({ exec: execFind });
    const skipMock: jest.Mock = jest.fn().mockReturnValue({ limit: limitMock });
    const sortMock: jest.Mock = jest.fn().mockReturnValue({ skip: skipMock });
    mockFind.mockReturnValue({ sort: sortMock });

    const execCount: jest.Mock = jest.fn().mockResolvedValue(42);
    mockCountDocuments.mockReturnValue({ exec: execCount });

    const result = await service.findAll(2, 10);

    expect(result.data).toEqual(fakeDocs);
    expect(result.total).toBe(42);
    expect(skipMock).toHaveBeenCalledWith(10);
    expect(limitMock).toHaveBeenCalledWith(10);
  });

  it('findByEmail queries by email and sorts descending', async () => {
    const fakeDocs: { _id: string; to: string }[] = [
      { _id: 'x', to: 'user@test.com' },
    ];

    const execMock: jest.Mock = jest.fn().mockResolvedValue(fakeDocs);
    const sortMock: jest.Mock = jest.fn().mockReturnValue({ exec: execMock });
    mockFind.mockReturnValue({ sort: sortMock });

    const result = await service.findByEmail('user@test.com');

    expect(mockFind).toHaveBeenCalledWith({ to: 'user@test.com' });
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(result).toEqual(fakeDocs);
  });
});
