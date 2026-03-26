import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { QuerySystemConfigDto } from './dto/query-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { SystemConfig } from './entities/system-config.entity';

@Injectable()
export class SystemConfigsService {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigsRepository: Repository<SystemConfig>,
  ) {}

  async findAll(query: QuerySystemConfigDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const keyword = query.keyword?.trim();

    const where = keyword
      ? [
          { key: Like(`%${keyword}%`), ...(query.groupName ? { groupName: query.groupName } : {}) },
          {
            name: Like(`%${keyword}%`),
            ...(query.groupName ? { groupName: query.groupName } : {}),
          },
        ]
      : { ...(query.groupName ? { groupName: query.groupName } : {}) };

    const [items, total] = await this.systemConfigsRepository.findAndCount({
      where,
      order: { groupName: 'ASC', createdAt: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { items, total, page, pageSize };
  }

  findOne(id: string) {
    return this.findOneOrFail(id);
  }

  async findByKey(key: string) {
    const item = await this.systemConfigsRepository.findOne({ where: { key } });
    if (!item) throw new NotFoundException('系统参数不存在');
    return item;
  }

  async create(dto: CreateSystemConfigDto) {
    await this.ensureKeyAvailable(dto.key);
    return this.systemConfigsRepository.save(
      this.systemConfigsRepository.create({
        key: dto.key,
        name: dto.name,
        valueType: dto.valueType,
        value: dto.value,
        groupName: dto.groupName ?? null,
        isSystem: dto.isSystem ?? false,
        remark: dto.remark ?? null,
      }),
    );
  }

  async update(id: string, dto: UpdateSystemConfigDto) {
    const item = await this.findOneOrFail(id);
    if (dto.key && dto.key !== item.key) {
      if (item.isSystem) {
        throw new ConflictException('系统内置参数不允许修改键名');
      }
      await this.ensureKeyAvailable(dto.key, id);
    }

    return this.systemConfigsRepository.save({
      ...item,
      ...dto,
      groupName: dto.groupName === undefined ? item.groupName : (dto.groupName ?? null),
      remark: dto.remark === undefined ? item.remark : (dto.remark ?? null),
    });
  }

  async remove(id: string) {
    const item = await this.findOneOrFail(id);
    if (item.isSystem) {
      throw new ConflictException('系统内置参数不允许删除');
    }
    await this.systemConfigsRepository.softDelete(id);
    return { message: '删除成功' };
  }

  private async findOneOrFail(id: string) {
    const item = await this.systemConfigsRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('系统参数不存在');
    return item;
  }

  private async ensureKeyAvailable(key: string, excludeId?: string) {
    const existing = await this.systemConfigsRepository.findOne({
      where: { key },
      withDeleted: true,
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('配置键已存在');
    }
  }
}
