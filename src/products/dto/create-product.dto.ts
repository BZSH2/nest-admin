import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: '会员月卡', description: '产品名称' })
  @IsNotEmpty({ message: '产品名称不能为空' })
  @IsString()
  @Length(2, 100, { message: '产品名称长度在2-100位之间' })
  name: string;

  @ApiProperty({
    example: 'vip_monthly',
    description: '产品代码，仅支持字母、数字、下划线和中划线',
  })
  @IsNotEmpty({ message: '产品代码不能为空' })
  @IsString()
  @Length(2, 50, { message: '产品代码长度在2-50位之间' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: '产品代码格式不正确' })
  code: string;

  @ApiProperty({
    example: '面向会员用户的月度订阅产品',
    description: '产品描述',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 255, { message: '产品描述长度不能超过255位' })
  description?: string | null;

  @ApiProperty({ example: true, description: '产品状态', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  status?: boolean = true;
}
