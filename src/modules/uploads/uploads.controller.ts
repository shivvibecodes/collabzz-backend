import { Body, Controller, Post } from '@nestjs/common';
import { createUploadUrlSchema } from './uploads.schema';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  async presignUpload(@Body() body: unknown) {
    const payload = createUploadUrlSchema.parse(body);

    return this.uploadsService.createSignedUploadUrl(payload);
  }
}
