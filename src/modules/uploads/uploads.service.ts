import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../config/env.schema';
import { CreateUploadUrlInput } from './uploads.schema';

@Injectable()
export class UploadsService {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService<Env, true>) {
    this.s3Client = new S3Client({
      region: this.configService.get('R2_REGION', { infer: true }),
      endpoint: `https://${this.configService.get('R2_ACCOUNT_ID', { infer: true })}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get('R2_ACCESS_KEY_ID', {
          infer: true,
        }),
        secretAccessKey: this.configService.get('R2_SECRET_ACCESS_KEY', {
          infer: true,
        }),
      },
    });
  }

  async createSignedUploadUrl(payload: CreateUploadUrlInput): Promise<{
    uploadUrl: string;
    key: string;
    publicUrl: string | null;
  }> {
    const bucket = this.configService.get('R2_BUCKET', { infer: true });
    const expiresIn = this.configService.get('R2_PRESIGNED_TTL_SECONDS', {
      infer: true,
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: payload.key,
      ContentType: payload.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

    const publicBaseUrl = this.configService.get('R2_PUBLIC_URL', {
      infer: true,
    });

    return {
      uploadUrl,
      key: payload.key,
      publicUrl: publicBaseUrl ? `${publicBaseUrl}/${payload.key}` : null,
    };
  }
}
