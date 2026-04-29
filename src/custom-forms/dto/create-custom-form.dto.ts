import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { FormItemDto } from './form-schema.dto';

export class CreateCustomFormDto {
  @ApiProperty({ example: 'interview-feedback' })
  @IsString()
  @IsNotEmpty({ message: '表单编码不能为空' })
  @Length(2, 80)
  @Matches(/^[a-zA-Z0-9._:-]+$/, { message: '表单编码格式不正确' })
  code: string;

  @ApiProperty({ example: '面试反馈表单' })
  @IsString()
  @IsNotEmpty({ message: '表单名称不能为空' })
  @Length(2, 120)
  name: string;

  @ApiPropertyOptional({ example: '用于收集一面反馈' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  remark?: string | null;

  @ApiProperty({
    type: [FormItemDto],
    description: '单个表单按 Form.Item[] 结构存储',
  })
  @IsArray({ message: 'schema 必须是数组' })
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => FormItemDto)
  schema: FormItemDto[];
}
