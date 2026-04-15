export const FORM_FIELD_TYPES = [
  'input',
  'textarea',
  'number',
  'select',
  'radio',
  'checkbox',
  'switch',
  'date',
  'custom',
] as const;

export const FORM_RULE_TRIGGERS = ['blur', 'change'] as const;

export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];
export type FormRuleTrigger = (typeof FORM_RULE_TRIGGERS)[number];
export type FormFieldValue = string | number | boolean | Array<string | number> | null;

/**
 * JSON 存储场景下，RegExp 需要转成可序列化结构。
 */
export interface SerializedFormPattern {
  source: string;
  flags?: string;
}

export interface FormOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

export interface FormRule {
  required?: boolean;
  message?: string;
  trigger?: FormRuleTrigger | FormRuleTrigger[];
  pattern?: string | RegExp | SerializedFormPattern;
  min?: number;
  max?: number;
  /**
   * 函数本身无法直接通过 JSON 传输；这里保留扩展位，供前端传校验器标识或可序列化配置。
   */
  validator?: unknown;
}

export interface FormItem<ValueType = FormFieldValue> {
  type: FormFieldType;
  label: string;
  name: string;
  value?: ValueType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  span?: number;
  options?: FormOption[];
  rules?: FormRule[];
  props?: Record<string, unknown>;
  id?: string;
}

export type FormSchema = FormItem[];
