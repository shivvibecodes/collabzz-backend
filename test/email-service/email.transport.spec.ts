/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { EmailTransport } from '../../src/modules/email/email.transport';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('EmailTransport', () => {
  let transport: EmailTransport;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = {
      getOrThrow: jest.fn().mockReturnValue('test-value'),
      get: jest.fn().mockReturnValue('Collabzz'),
    };
    transport = new EmailTransport(config as unknown as ConfigService);
    mockedAxios.isAxiosError = jest
      .fn()
      .mockReturnValue(false) as unknown as typeof mockedAxios.isAxiosError;
  });

  it('sends email and returns messageId from Brevo', async () => {
    mockedAxios.post.mockResolvedValue({ data: { messageId: '<abc@brevo>' } });

    const result = await transport.send({
      to: 'user@test.com',
      subject: 'Hello',
      html: '<p>Hello</p>',
    });

    expect(result.messageId).toBe('<abc@brevo>');

    const [url, body, config] = mockedAxios.post.mock.calls[0] as [
      string,
      Record<string, unknown>,
      Record<string, unknown>,
    ];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect(body).toEqual(
      expect.objectContaining({ to: [{ email: 'user@test.com' }] }),
    );
    expect(config).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({ 'api-key': 'test-value' }),
      }),
    );
  });

  it('uses fallback messageId when Brevo response omits it', async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });

    const result = await transport.send({
      to: 'a@b.com',
      subject: 'Hi',
      html: '',
    });

    expect(result.messageId).toMatch(/^brevo-fallback-\d+$/);
  });

  it('throws and logs on Brevo 401 unauthorized (axios error)', async () => {
    mockedAxios.post.mockRejectedValue({
      response: { status: 401, data: { message: 'Unauthorized' } },
      message: 'Request failed with status code 401',
    });

    await expect(
      transport.send({ to: 'a@b.com', subject: 'Hi', html: '' }),
    ).rejects.toBeTruthy();
  });

  it('throws and logs on unexpected non-axios error', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Unexpected crash'));

    await expect(
      transport.send({ to: 'a@b.com', subject: 'Hi', html: '' }),
    ).rejects.toThrow('Unexpected crash');
  });

  it('sends correct sender info from config', async () => {
    mockedAxios.post.mockResolvedValue({ data: { messageId: '<xyz@brevo>' } });

    await transport.send({
      to: 'recv@test.com',
      subject: 'Subj',
      html: '<b>Hi</b>',
    });

    const [, body] = mockedAxios.post.mock.calls[0] as [
      string,
      Record<string, unknown>,
      Record<string, unknown>,
    ];
    expect(body).toEqual(
      expect.objectContaining({
        sender: { name: 'Collabzz', email: 'test-value' },
        subject: 'Subj',
        htmlContent: '<b>Hi</b>',
      }),
    );
  });
});
