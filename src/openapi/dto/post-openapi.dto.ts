import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class ModuleSelectionDto {
  @ApiProperty({ example: 'Auth', description: 'Service prefix (Tag)' })
  @IsNotEmpty()
  @IsString()
  prefix: string;

  @ApiProperty({ example: ['LoginModule'], description: 'List of modules to export' })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  service: string[];
}

export class PostOpenApiDto {
  @ApiProperty({
    description: 'List of module selections',
    type: [ModuleSelectionDto],
    example: [
      { prefix: 'Auth', service: ['LoginModule'] },
      { prefix: 'OpenAPI', service: ['OpenAPIModule'] },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleSelectionDto)
  modules: ModuleSelectionDto[];
}
