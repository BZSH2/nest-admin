import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import type { DnsRecordType, DnsRelationEnvironment } from '../entities/dns-relation.entity';

export class CreateDnsRelationDto {
  @ApiProperty({ example: 'vue-admin' })
  @IsNotEmpty({ message: '项目名称不能为空' })
  @IsString()
  @Length(2, 100)
  projectName: string;

  @ApiProperty({ required: false, example: 'admin-web' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  serviceName?: string | null;

  @ApiProperty({
    required: false,
    enum: ['dev', 'test', 'staging', 'uat', 'prod'],
    example: 'prod',
  })
  @IsOptional()
  @IsIn(['dev', 'test', 'staging', 'uat', 'prod'])
  environment?: DnsRelationEnvironment | null;

  @ApiProperty({ example: 'vue.admin.bzsh.fun' })
  @IsNotEmpty({ message: '域名不能为空' })
  @IsString()
  @Length(2, 255)
  domain: string;

  @ApiProperty({ required: false, example: 'Cloudflare' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  provider?: string | null;

  @ApiProperty({ enum: ['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'SRV'], example: 'CNAME' })
  @IsIn(['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'SRV'])
  recordType: DnsRecordType;

  @ApiProperty({ example: 'iZuf6buz6c8f5ah3um2betZ' })
  @IsNotEmpty({ message: '解析值不能为空' })
  @IsString()
  @Length(1, 500)
  recordValue: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean = true;

  @ApiProperty({ required: false, example: '当前服务器正式环境入口' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  remark?: string | null;
}
