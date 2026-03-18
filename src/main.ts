import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { setupSwagger } from './common/swagger/setup';
import { OpenApiService } from './openapi/openapi.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // API Prefix
  const prefix = configService.get<string>('API_PREFIX') || 'api';
  app.setGlobalPrefix(prefix);

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS
  app.enableCors();

  // Swagger
  const document = setupSwagger(app);
  OpenApiService.setDocument(document);

  const port = configService.get<number>('PORT') || 35000;
  const host = configService.get<string>('HOST') || '0.0.0.0';
  const protocol = configService.get<string>('PROTOCOL') || 'http';
  const swaggerPath = configService.get<string>('SWAGGER_PATH') || 'docs';
  await app.listen(port, host);
  const displayHost = host === '0.0.0.0' ? '127.0.0.1' : host;
  const baseUrl = `${protocol}://${displayHost}:${port}`;
  Logger.log(`Application is running on: ${baseUrl}/${prefix}`, 'Bootstrap');
  Logger.log(`Swagger documentation: ${baseUrl}/${swaggerPath}`, 'Bootstrap');
}
bootstrap();
