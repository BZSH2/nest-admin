import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiModule } from '../common/decorators/api-module.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { PostOpenApiDto } from './dto/post-openapi.dto';
import { OpenApiService } from './openapi.service';

@ApiTags('OpenAPI')
@Controller()
export class OpenApiController {
  constructor(private readonly openApiService: OpenApiService) {}

  @Public()
  @Post('postOpenApiJson')
  @ApiModule('OpenAPIModule')
  @ApiOperation({ summary: 'Get OpenAPI JSON for modules' })
  postOpenApiJson(@Body() dto: PostOpenApiDto) {
    return this.openApiService.getOpenApiJson(dto);
  }

  @Public()
  @Get('getModules')
  @ApiModule('OpenAPIModule')
  @ApiOperation({ summary: 'Get available modules and services' })
  getModules() {
    return this.openApiService.getModules();
  }

  @Public()
  @Get('getPostOpenApiJsonDefinition')
  @ApiModule('OpenAPIModule')
  @ApiOperation({ summary: 'Get OpenAPI JSON for postOpenApiJson endpoint' })
  getPostOpenApiJsonDefinition() {
    return this.openApiService.getSingleOpenApiJson();
  }
}
