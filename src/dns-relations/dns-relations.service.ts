import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateDnsRelationDto } from './dto/create-dns-relation.dto';
import { QueryDnsRelationDto } from './dto/query-dns-relation.dto';
import { UpdateDnsRelationDto } from './dto/update-dns-relation.dto';
import { DnsRelation } from './entities/dns-relation.entity';

@Injectable()
export class DnsRelationsService {
  constructor(
    @InjectRepository(DnsRelation)
    private readonly dnsRelationsRepository: Repository<DnsRelation>,
  ) {}

  async findAll(query: QueryDnsRelationDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const keyword = query.keyword?.trim();
    const baseFilter = {
      ...(query.environment ? { environment: query.environment } : {}),
      ...(query.enabled == null ? {} : { enabled: query.enabled }),
    };

    const where = keyword
      ? [
          { projectName: Like(`%${keyword}%`), ...baseFilter },
          { serviceName: Like(`%${keyword}%`), ...baseFilter },
          { domain: Like(`%${keyword}%`), ...baseFilter },
          { provider: Like(`%${keyword}%`), ...baseFilter },
          { recordValue: Like(`%${keyword}%`), ...baseFilter },
        ]
      : baseFilter;

    const [items, total] = await this.dnsRelationsRepository.findAndCount({
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

  async create(dto: CreateDnsRelationDto) {
    return this.dnsRelationsRepository.save(
      this.dnsRelationsRepository.create({
        projectName: this.normalizeRequiredText(dto.projectName, '项目名称'),
        serviceName: this.normalizeNullableText(dto.serviceName),
        environment: dto.environment ?? null,
        domain: this.normalizeRequiredText(dto.domain, '域名'),
        provider: this.normalizeNullableText(dto.provider),
        recordType: dto.recordType,
        recordValue: this.normalizeRequiredText(dto.recordValue, '解析值'),
        enabled: dto.enabled ?? true,
        remark: this.normalizeNullableText(dto.remark),
      }),
    );
  }

  async update(id: string, dto: UpdateDnsRelationDto) {
    const item = await this.findOneOrFail(id);

    return this.dnsRelationsRepository.save({
      ...item,
      projectName:
        dto.projectName === undefined
          ? item.projectName
          : this.normalizeRequiredText(dto.projectName, '项目名称'),
      serviceName:
        dto.serviceName === undefined ? item.serviceName : this.normalizeNullableText(dto.serviceName),
      environment: dto.environment === undefined ? item.environment : (dto.environment ?? null),
      domain:
        dto.domain === undefined ? item.domain : this.normalizeRequiredText(dto.domain, '域名'),
      provider: dto.provider === undefined ? item.provider : this.normalizeNullableText(dto.provider),
      recordType: dto.recordType ?? item.recordType,
      recordValue:
        dto.recordValue === undefined
          ? item.recordValue
          : this.normalizeRequiredText(dto.recordValue, '解析值'),
      enabled: dto.enabled ?? item.enabled,
      remark: dto.remark === undefined ? item.remark : this.normalizeNullableText(dto.remark),
    });
  }

  async remove(id: string) {
    await this.findOneOrFail(id);
    await this.dnsRelationsRepository.softDelete(id);
    return { message: '删除成功' };
  }

  private async findOneOrFail(id: string) {
    const item = await this.dnsRelationsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('DNS关联记录不存在');
    }
    return item;
  }

  private normalizeRequiredText(value: string, label: string) {
    const text = value?.trim();
    if (!text) {
      throw new BadRequestException(`${label}不能为空`);
    }
    return text;
  }

  private normalizeNullableText(value?: string | null) {
    const text = value?.trim();
    return text ? text : null;
  }
}
