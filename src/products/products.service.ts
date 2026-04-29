import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(query: QueryProductDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const keyword = query.keyword?.trim();

    const where = this.buildWhere(keyword, query.status);
    const [items, total] = await this.productsRepository.findAndCount({
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

  async create(dto: CreateProductDto) {
    const code = this.normalizeRequiredText(dto.code, '产品代码');
    const name = this.normalizeRequiredText(dto.name, '产品名称');

    await this.ensureCodeAvailable(code);

    return this.productsRepository.save(
      this.productsRepository.create({
        code,
        name,
        description: this.normalizeNullableText(dto.description),
        status: dto.status ?? true,
      }),
    );
  }

  async update(id: string, dto: UpdateProductDto) {
    const item = await this.findOneOrFail(id);
    const nextCode =
      dto.code === undefined ? undefined : this.normalizeRequiredText(dto.code, '产品代码');
    const nextName =
      dto.name === undefined ? undefined : this.normalizeRequiredText(dto.name, '产品名称');

    if (nextCode && nextCode !== item.code) {
      await this.ensureCodeAvailable(nextCode, id);
    }

    return this.productsRepository.save({
      ...item,
      code: nextCode ?? item.code,
      name: nextName ?? item.name,
      description:
        dto.description === undefined
          ? item.description
          : this.normalizeNullableText(dto.description),
      status: dto.status ?? item.status,
    });
  }

  async remove(id: string) {
    await this.findOneOrFail(id);
    await this.productsRepository.softDelete(id);
    return { message: '删除成功' };
  }

  private buildWhere(keyword?: string, status?: boolean) {
    if (!keyword && status == null) {
      return undefined;
    }

    const keywordWhere = keyword
      ? [{ name: Like(`%${keyword}%`) }, { code: Like(`%${keyword}%`) }]
      : [{}];

    return keywordWhere.map((item) => ({
      ...item,
      ...(status == null ? {} : { status }),
    }));
  }

  private async findOneOrFail(id: string) {
    const item = await this.productsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('产品不存在');
    }
    return item;
  }

  private async ensureCodeAvailable(code: string, excludeId?: string) {
    const existing = await this.productsRepository.findOne({
      where: { code },
      withDeleted: true,
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException('产品代码已存在');
    }
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
