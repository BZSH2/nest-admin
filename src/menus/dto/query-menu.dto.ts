import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { MenuType } from '../entities/menu.entity';

export class QueryMenuDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @ApiProperty({ required: false, example: 'system' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ required: false, enum: ['directory', 'menu', 'button'] })
  @IsOptional()
  @IsIn(['directory', 'menu', 'button'])
  type?: MenuType;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : value === 'true' || value === true,
  )
  @IsBoolean()
  enabled?: boolean;
}
