import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Allow,
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  FORM_FIELD_TYPES,
  type FormFieldType,
  type FormFieldValue,
  type FormItem,
  type FormOption,
  type FormRule,
} from '../custom-form.types';

export class FormOptionDto implements FormOption {
  @ApiProperty({ example: '研发岗' })
  @IsString()
  @IsNotEmpty({ message: '选项文案不能为空' })
  @Length(1, 80)
  label: string;

  @ApiProperty({
    description: '选项值，支持 string / number / boolean',
    example: 'rd',
  })
  @IsDefined({ message: '选项值不能为空' })
  @Allow()
  value: string | number | boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}

export class FormRuleDto implements FormRule {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ example: '请输入字段内容' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  message?: string;

  @ApiPropertyOptional({
    description: '支持 blur / change，或传数组 ["blur", "change"]',
    example: 'blur',
  })
  @IsOptional()
  @Allow()
  trigger?: 'blur' | 'change' | Array<'blur' | 'change'>;

  @ApiPropertyOptional({
    description: '正则建议传 source 字符串，或 { source, flags } 的可序列化对象',
    example: { source: '^1[3-9]\\d{9}$' },
  })
  @IsOptional()
  @Allow()
  pattern?: string | RegExp | { source: string; flags?: string };

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  min?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  max?: number;

  @ApiPropertyOptional({
    description: '自定义校验器占位。函数本身不能直接通过 JSON 传输。',
    example: { key: 'phoneValidator' },
  })
  @IsOptional()
  @Allow()
  validator?: unknown;
}

export class FormItemDto implements FormItem<FormFieldValue> {
  @ApiProperty({ enum: FORM_FIELD_TYPES, example: 'input' })
  @IsIn(FORM_FIELD_TYPES)
  type: FormFieldType;

  @ApiProperty({ example: '姓名' })
  @IsString()
  @IsNotEmpty({ message: '字段标签不能为空' })
  @Length(1, 80)
  label: string;

  @ApiProperty({ example: 'realName' })
  @IsString()
  @IsNotEmpty({ message: '字段 name 不能为空' })
  @Length(1, 80)
  @Matches(/^[a-zA-Z][a-zA-Z0-9_.:-]*$/, {
    message: '字段 name 格式不正确，只支持字母开头和字母数字下划线点中划线冒号',
  })
  name: string;

  @ApiPropertyOptional({ description: '字段默认值' })
  @IsOptional()
  @Allow()
  value?: FormFieldValue;

  @ApiPropertyOptional({ example: '请输入姓名' })
  @IsOptional()
  @IsString()
  @Length(0, 120)
  placeholder?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @ApiPropertyOptional({ example: 12, minimum: 1, maximum: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  span?: number;

  @ApiPropertyOptional({ type: [FormOptionDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => FormOptionDto)
  options?: FormOptionDto[];

  @ApiPropertyOptional({ type: [FormRuleDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => FormRuleDto)
  rules?: FormRuleDto[];

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { clearable: true, rows: 4 },
  })
  @IsOptional()
  @IsObject()
  props?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: '字段唯一值；如果前端未传，服务端会自动生成。',
    example: 'field_7b0d97ab',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  id?: string;
}
