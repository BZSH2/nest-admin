import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenApiController } from './openapi.controller';
import { OpenApiService } from './openapi.service';

@Module({
  imports: [ConfigModule],
  controllers: [OpenApiController],
  providers: [OpenApiService],
  exports: [OpenApiService],
})
export class OpenApiModule {}
