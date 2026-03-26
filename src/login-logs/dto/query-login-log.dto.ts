import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryLoginLogDto {
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

  @ApiProperty({ required: false, example: '138' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : value === 'true' || value === true,
  )
  @IsBoolean()
  success?: boolean;
}
