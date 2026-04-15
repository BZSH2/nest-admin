import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CustomFormPatternDto {
  @ApiProperty({ description: '正则表达式 source', example: '^1[3-9]\\d{9}$' })
  source: string;

  @ApiPropertyOptional({ description: '正则 flags', example: 'i', nullable: true })
  flags?: string;
}

class CustomFormOptionDetailDto {
  @ApiProperty({ description: '选项文案', example: '前端' })
  label: string;

  @ApiProperty({
    description: '选项值，支持 string / number / boolean',
    example: 'frontend',
  })
  value: string | number | boolean;

  @ApiPropertyOptional({ description: '是否禁用该选项', example: false })
  disabled?: boolean;
}

class CustomFormRuleDetailDto {
  @ApiPropertyOptional({ description: '是否必填', example: true })
  required?: boolean;

  @ApiPropertyOptional({ description: '校验失败提示文案', example: '请输入手机号' })
  message?: string;

  @ApiPropertyOptional({
    description: '触发时机，可为 blur / change，或数组',
    oneOf: [
      { type: 'string', enum: ['blur', 'change'] },
      { type: 'array', items: { type: 'string', enum: ['blur', 'change'] } },
    ],
    example: ['blur', 'change'],
  })
  trigger?: 'blur' | 'change' | Array<'blur' | 'change'>;

  @ApiPropertyOptional({
    description: '正则配置；服务端存为可序列化结构',
    type: CustomFormPatternDto,
  })
  pattern?: CustomFormPatternDto;

  @ApiPropertyOptional({ description: '最小值/最小长度', example: 1 })
  min?: number;

  @ApiPropertyOptional({ description: '最大值/最大长度', example: 50 })
  max?: number;

  @ApiPropertyOptional({
    description: '自定义校验器的可序列化配置占位',
    type: 'object',
    additionalProperties: true,
    example: { key: 'phoneValidator' },
  })
  validator?: unknown;
}

class CustomFormItemDetailDto {
  @ApiProperty({
    description: '字段类型',
    enum: ['input', 'textarea', 'number', 'select', 'radio', 'checkbox', 'switch', 'date', 'custom'],
    example: 'input',
  })
  type: string;

  @ApiProperty({ description: '字段标签', example: '姓名' })
  label: string;

  @ApiProperty({ description: '字段 name', example: 'realName' })
  name: string;

  @ApiPropertyOptional({
    description: '默认值，支持 string / number / boolean / array / null',
    nullable: true,
    example: null,
  })
  value?: string | number | boolean | Array<string | number> | null;

  @ApiPropertyOptional({ description: '占位提示', example: '请输入姓名' })
  placeholder?: string;

  @ApiPropertyOptional({ description: '是否必填', example: true })
  required?: boolean;

  @ApiPropertyOptional({ description: '是否禁用', example: false })
  disabled?: boolean;

  @ApiPropertyOptional({ description: '是否隐藏', example: false })
  hidden?: boolean;

  @ApiPropertyOptional({ description: '栅格占位（24 栅格）', example: 12 })
  span?: number;

  @ApiPropertyOptional({ type: [CustomFormOptionDetailDto], description: '可选项列表' })
  options?: CustomFormOptionDetailDto[];

  @ApiPropertyOptional({ type: [CustomFormRuleDetailDto], description: '校验规则' })
  rules?: CustomFormRuleDetailDto[];

  @ApiPropertyOptional({
    description: '透传组件 props',
    type: 'object',
    additionalProperties: true,
    example: { clearable: true, rows: 4 },
  })
  props?: Record<string, unknown>;

  @ApiProperty({ description: '字段唯一 id', example: 'a8b53e4d-4b91-4f98-9ce3-8b8ab0ef85b6' })
  id: string;
}

export class CustomFormDetailDto {
  @ApiProperty({ description: '自定义表单 ID', example: 'a8b53e4d-4b91-4f98-9ce3-8b8ab0ef85b6' })
  id: string;

  @ApiProperty({ description: '表单编码', example: 'interview-feedback' })
  code: string;

  @ApiProperty({ description: '表单名称', example: '面试反馈表单' })
  name: string;

  @ApiProperty({
    type: [CustomFormItemDetailDto],
    description: '表单 Schema，单个表单按 Form.Item[] 存储',
  })
  schema: CustomFormItemDetailDto[];

  @ApiPropertyOptional({ description: '备注', example: '用于一面反馈', nullable: true })
  remark?: string | null;

  @ApiProperty({ description: '创建时间', example: '2026-04-15T03:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2026-04-15T03:10:00.000Z' })
  updatedAt: Date;
}
