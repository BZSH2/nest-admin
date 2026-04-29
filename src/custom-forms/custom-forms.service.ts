import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { FORM_RULE_TRIGGERS, type FormItem, type SerializedFormPattern } from './custom-form.types';
import { CreateCustomFormDto } from './dto/create-custom-form.dto';
import { FormItemDto, FormOptionDto, FormRuleDto } from './dto/form-schema.dto';
import { QueryCustomFormDto } from './dto/query-custom-form.dto';
import { UpdateCustomFormDto } from './dto/update-custom-form.dto';
import { CustomForm } from './entities/custom-form.entity';

const OPTION_FIELD_TYPES = new Set(['select', 'radio', 'checkbox']);
const RULE_TRIGGER_SET = new Set(FORM_RULE_TRIGGERS);

@Injectable()
export class CustomFormsService {
  constructor(
    @InjectRepository(CustomForm)
    private readonly customFormsRepository: Repository<CustomForm>,
  ) {}

  async findAll(query: QueryCustomFormDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const keyword = query.keyword?.trim();

    const where = keyword ? [{ code: Like(`%${keyword}%`) }, { name: Like(`%${keyword}%`) }] : {};

    const [items, total] = await this.customFormsRepository.findAndCount({
      where,
      order: { updatedAt: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { items, total, page, pageSize };
  }

  findOne(id: string) {
    return this.findOneOrFail(id);
  }

  async findByCode(code: string) {
    const item = await this.customFormsRepository.findOne({ where: { code: code.trim() } });
    if (!item) {
      throw new NotFoundException('自定义表单不存在');
    }
    return item;
  }

  async create(dto: CreateCustomFormDto) {
    const code = dto.code.trim();
    const name = dto.name.trim();

    if (!code) {
      throw new BadRequestException('表单编码不能为空');
    }
    if (!name) {
      throw new BadRequestException('表单名称不能为空');
    }

    await this.ensureCodeAvailable(code);

    return this.customFormsRepository.save(
      this.customFormsRepository.create({
        code,
        name,
        remark: this.normalizeNullableText(dto.remark),
        schema: this.normalizeSchema(dto.schema),
      }),
    );
  }

  async update(id: string, dto: UpdateCustomFormDto) {
    const item = await this.findOneOrFail(id);
    const nextCode = dto.code?.trim();
    const nextName = dto.name?.trim();

    if (dto.code !== undefined && !nextCode) {
      throw new BadRequestException('表单编码不能为空');
    }
    if (dto.name !== undefined && !nextName) {
      throw new BadRequestException('表单名称不能为空');
    }

    if (nextCode && nextCode !== item.code) {
      await this.ensureCodeAvailable(nextCode, id);
    }

    return this.customFormsRepository.save({
      ...item,
      code: nextCode ?? item.code,
      name: nextName ?? item.name,
      remark:
        dto.remark === undefined ? item.remark : this.normalizeNullableText(dto.remark ?? null),
      schema: dto.schema === undefined ? item.schema : this.normalizeSchema(dto.schema),
    });
  }

  async remove(id: string) {
    await this.findOneOrFail(id);
    await this.customFormsRepository.softDelete(id);
    return { message: '删除成功' };
  }

  private async findOneOrFail(id: string) {
    const item = await this.customFormsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('自定义表单不存在');
    }
    return item;
  }

  private async ensureCodeAvailable(code: string, excludeId?: string) {
    const existing = await this.customFormsRepository.findOne({
      where: { code },
      withDeleted: true,
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException('表单编码已存在');
    }
  }

  private normalizeSchema(schema: FormItemDto[]): FormItem[] {
    const names = new Set<string>();
    const ids = new Set<string>();

    return schema.map((schemaItem, index) => {
      const label = schemaItem.label.trim();
      const name = schemaItem.name.trim();
      const id = schemaItem.id?.trim() || randomUUID();

      if (!label) {
        throw new BadRequestException(`第 ${index + 1} 个字段 label 不能为空`);
      }
      if (!name) {
        throw new BadRequestException(`第 ${index + 1} 个字段 name 不能为空`);
      }

      if (names.has(name)) {
        throw new BadRequestException(`第 ${index + 1} 个字段 name 重复：${name}`);
      }
      names.add(name);

      if (ids.has(id)) {
        throw new BadRequestException(`第 ${index + 1} 个字段 id 重复：${id}`);
      }
      ids.add(id);

      const options = this.normalizeOptions(schemaItem.options, schemaItem.type, label, index);
      const rules = this.normalizeRules(schemaItem.rules, label, index);

      const item: FormItem = {
        type: schemaItem.type,
        label,
        name,
        id,
      };

      if (schemaItem.value !== undefined) {
        item.value = schemaItem.value;
      }
      if (schemaItem.placeholder !== undefined) {
        item.placeholder = schemaItem.placeholder.trim();
      }
      if (schemaItem.required !== undefined) {
        item.required = schemaItem.required;
      }
      if (schemaItem.disabled !== undefined) {
        item.disabled = schemaItem.disabled;
      }
      if (schemaItem.hidden !== undefined) {
        item.hidden = schemaItem.hidden;
      }
      if (schemaItem.span !== undefined) {
        item.span = schemaItem.span;
      }
      if (options) {
        item.options = options;
      }
      if (rules) {
        item.rules = rules;
      }
      if (schemaItem.props !== undefined) {
        item.props = schemaItem.props;
      }

      return item;
    });
  }

  private normalizeOptions(
    options: FormOptionDto[] | undefined,
    type: string,
    label: string,
    index: number,
  ) {
    if (OPTION_FIELD_TYPES.has(type) && (!options || options.length === 0)) {
      throw new BadRequestException(
        `第 ${index + 1} 个字段（${label}）为 ${type} 类型，必须提供 options`,
      );
    }

    if (!options?.length) {
      return undefined;
    }

    return options.map((option, optionIndex) => {
      const optionLabel = option.label.trim();
      if (!optionLabel) {
        throw new BadRequestException(
          `第 ${index + 1} 个字段（${label}）的第 ${optionIndex + 1} 个选项文案不能为空`,
        );
      }

      return {
        label: optionLabel,
        value: option.value,
        disabled: option.disabled,
      };
    });
  }

  private normalizeRules(rules: FormRuleDto[] | undefined, label: string, index: number) {
    if (!rules?.length) {
      return undefined;
    }

    return rules.map((rule, ruleIndex) => {
      if (
        rule.min !== undefined &&
        rule.max !== undefined &&
        Number.isFinite(rule.min) &&
        Number.isFinite(rule.max) &&
        rule.min > rule.max
      ) {
        throw new BadRequestException(
          `第 ${index + 1} 个字段（${label}）的第 ${ruleIndex + 1} 条规则 min 不能大于 max`,
        );
      }

      const normalizedRule: FormRuleDto = {};

      if (rule.required !== undefined) {
        normalizedRule.required = rule.required;
      }
      if (rule.message !== undefined) {
        const message = rule.message.trim();
        if (!message) {
          throw new BadRequestException(
            `第 ${index + 1} 个字段（${label}）的第 ${ruleIndex + 1} 条规则 message 不能为空`,
          );
        }
        normalizedRule.message = message;
      }
      if (rule.trigger !== undefined) {
        normalizedRule.trigger = this.normalizeTrigger(rule.trigger, label, index, ruleIndex);
      }
      if (rule.pattern !== undefined) {
        normalizedRule.pattern = this.normalizePattern(rule.pattern, label, index, ruleIndex);
      }
      if (rule.min !== undefined) {
        normalizedRule.min = rule.min;
      }
      if (rule.max !== undefined) {
        normalizedRule.max = rule.max;
      }
      if (rule.validator !== undefined) {
        if (typeof rule.validator === 'function') {
          throw new BadRequestException(
            `第 ${index + 1} 个字段（${label}）的第 ${ruleIndex + 1} 条规则 validator 不能直接传函数`,
          );
        }
        normalizedRule.validator = rule.validator;
      }

      return normalizedRule;
    });
  }

  private normalizeTrigger(
    trigger: FormRuleDto['trigger'],
    label: string,
    index: number,
    ruleIndex: number,
  ): 'blur' | 'change' | Array<'blur' | 'change'> {
    const triggerList = Array.isArray(trigger) ? trigger : [trigger];
    const normalizedTriggers: Array<'blur' | 'change'> = [];

    for (const item of triggerList) {
      if (typeof item !== 'string' || !RULE_TRIGGER_SET.has(item as 'blur' | 'change')) {
        throw new BadRequestException(
          `第 ${index + 1} 个字段（${label}）的第 ${ruleIndex + 1} 条规则 trigger 非法`,
        );
      }
      normalizedTriggers.push(item as 'blur' | 'change');
    }

    return Array.isArray(trigger) ? Array.from(new Set(normalizedTriggers)) : normalizedTriggers[0];
  }

  private normalizePattern(
    pattern: FormRuleDto['pattern'],
    label: string,
    index: number,
    ruleIndex: number,
  ): SerializedFormPattern {
    if (typeof pattern === 'string') {
      const source = pattern.trim();
      if (!source) {
        throw new BadRequestException(
          `第 ${index + 1} 个字段（${label}）的第 ${ruleIndex + 1} 条规则 pattern 不能为空`,
        );
      }
      return { source };
    }

    if (pattern instanceof RegExp) {
      return {
        source: pattern.source,
        flags: pattern.flags || undefined,
      };
    }

    if (this.isRecord(pattern) && typeof pattern.source === 'string') {
      const source = pattern.source.trim();
      if (!source) {
        throw new BadRequestException(
          `第 ${index + 1} 个字段（${label}）的第 ${ruleIndex + 1} 条规则 pattern.source 不能为空`,
        );
      }

      return {
        source,
        flags: typeof pattern.flags === 'string' ? pattern.flags : undefined,
      };
    }

    throw new BadRequestException(
      `第 ${index + 1} 个字段（${label}）的第 ${ruleIndex + 1} 条规则 pattern 格式不正确`,
    );
  }

  private normalizeNullableText(value: string | null | undefined) {
    const nextValue = value?.trim();
    return nextValue ? nextValue : null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
