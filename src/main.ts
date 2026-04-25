import { NestFactory } from '@nestjs/core';
import helmet from '@fastify/helmet';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Env } from './config/env.schema';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: true,
      logger: true,
      bodyLimit: 10 * 1024 * 1024,
    }),
  );

  const configService = app.get<ConfigService<Env, true>>(ConfigService);

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  app.enableCors({
    origin: configService.get('CORS_ORIGIN', { infer: true }).split(','),
    credentials: true,
  });
  app.setGlobalPrefix(configService.get('API_PREFIX', { infer: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new RequestIdInterceptor());

  app.enableShutdownHooks();

  const port = configService.get('PORT', { infer: true });
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
