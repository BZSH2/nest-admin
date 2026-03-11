import { type INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): OpenAPIObject {
  const configService = app.get(ConfigService);
  const swaggerPath = configService.get<string>('SWAGGER_PATH') || 'docs';

  const config = new DocumentBuilder()
    .setTitle('Nest Admin API')
    .setDescription('The Nest Admin API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document);

  Logger.log(
    `Swagger documentation is available at: http://localhost:${configService.get('PORT') || 3000}/${swaggerPath}`,
    'Swagger',
  );

  return document;
}
