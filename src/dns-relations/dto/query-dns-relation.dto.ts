import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { DnsRelationEnvironment } from '../entities/dns-relation.entity';

export class QueryDnsRelationDto {
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

  @ApiProperty({ required: false, example: 'vue-admin' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({
    required: false,
    enum: ['dev', 'test', 'staging', 'uat', 'prod'],
    example: 'prod',
  })
  @IsOptional()
  @IsIn(['dev', 'test', 'staging', 'uat', 'prod'])
  environment?: DnsRelationEnvironment;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  @IsBoolean()
  enabled?: boolean;
}
