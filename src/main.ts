import { mkdir } from 'node:fs/promises';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { setupSwagger } from './common/swagger/setup';
import { OpenApiService } from './openapi/openapi.service';
import {
  normalizeRoutePrefix,
  resolveStaticAssetsRootDir,
} from './static-assets/static-assets.utils';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const staticAssetsRootDir = resolveStaticAssetsRootDir(
    configService.get<string>('STATIC_ASSETS_DIR'),
  );
  const staticAssetsRoutePrefix = normalizeRoutePrefix(
    configService.get<string>('STATIC_ASSETS_ROUTE_PREFIX'),
  );

  const staticAssetsPublicPrefix = `/${staticAssetsRoutePrefix}/`;

  await mkdir(staticAssetsRootDir, { recursive: true });
  app.useStaticAssets(staticAssetsRootDir, {
    prefix: staticAssetsPublicPrefix,
  });

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
  Logger.log(`Static assets exposed at: ${baseUrl}${staticAssetsPublicPrefix}`, 'Bootstrap');
}
bootstrap();
