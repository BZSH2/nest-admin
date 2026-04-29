import { createHash } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Like, Repository } from 'typeorm';
import { BatchDeleteStaticAssetsDto } from './dto/batch-delete-static-assets.dto';
import { type QueryStaticAssetDto } from './dto/query-static-asset.dto';
import { type StaticAssetDetailDto } from './dto/static-asset-detail.dto';
import { type StaticAssetFolderOptionDto } from './dto/static-asset-folder-option.dto';
import { UpdateStaticAssetDto } from './dto/update-static-asset.dto';
import { UploadStaticAssetDto } from './dto/upload-static-asset.dto';
import { StaticAsset } from './entities/static-asset.entity';
import {
  buildStaticAssetAbsolutePath,
  buildStaticAssetAccessPath,
  buildStaticAssetAccessUrl,
  buildStaticAssetStoragePath,
  inferStaticAssetFileType,
  normalizeRoutePrefix,
  resolveStaticAssetExtension,
  resolveStaticAssetMimeType,
  resolveStaticAssetsRootDir,
} from './static-assets.utils';

type UploadedStaticAssetFile = {
  originalname?: string;
  mimetype?: string;
  size?: number;
  buffer?: Buffer;
};

@Injectable()
export class StaticAssetsService {
  private readonly logger = new Logger(StaticAssetsService.name);

  constructor(
    @InjectRepository(StaticAsset)
    private readonly staticAssetsRepository: Repository<StaticAsset>,
    private readonly configService: ConfigService,
  ) {}

  async findAll(query: QueryStaticAssetDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const keyword = query.keyword?.trim();
    const normalizedFolder = query.folder?.trim();
    const baseFilter: Record<string, unknown> = {
      ...(query.imagesOnly
        ? { fileType: 'image' }
        : query.fileType
          ? { fileType: query.fileType }
          : {}),
      ...(query.uncategorizedOnly
        ? { folder: IsNull() }
        : normalizedFolder
          ? { folder: normalizedFolder }
          : {}),
    };

    const where = keyword
      ? [
          { name: Like(`%${keyword}%`), ...baseFilter },
          { originalName: Like(`%${keyword}%`), ...baseFilter },
          { storagePath: Like(`%${keyword}%`), ...baseFilter },
          { hash: Like(`%${keyword}%`), ...baseFilter },
        ]
      : baseFilter;

    const [items, total] = await this.staticAssetsRepository.findAndCount({
      where,
      order: { updatedAt: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: items.map((item) => this.toDetail(item)),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const item = await this.findOneOrFail(id);
    return this.toDetail(item);
  }

  async findFolders(): Promise<StaticAssetFolderOptionDto[]> {
    const rows: Array<{ folder: string | null; count: string | number }> =
      await this.staticAssetsRepository.query(`
        SELECT folder, COUNT(id) AS count
        FROM static_assets
        WHERE deletedAt IS NULL
        GROUP BY folder
        ORDER BY CASE WHEN folder IS NULL OR folder = '' THEN 1 ELSE 0 END ASC, folder ASC
      `);

    return rows.map((row) => {
      const folder = this.normalizeFolderValue(row.folder);
      const uncategorized = !folder;

      return {
        folder,
        label: folder ?? '未分组',
        uncategorized,
        count: Number(row.count ?? 0),
      };
    });
  }

  async upload(file: UploadedStaticAssetFile | undefined, dto: UploadStaticAssetDto) {
    const buffer = file?.buffer;
    if (!buffer?.length) {
      throw new BadRequestException('请上传文件');
    }

    const originalName = this.normalizeOriginalName(file.originalname);
    const extension = resolveStaticAssetExtension(originalName, file.mimetype);
    const mimeType = resolveStaticAssetMimeType(file.mimetype, extension);
    const displayName = this.resolveDisplayName(dto.name, originalName, extension);
    const storagePath = buildStaticAssetStoragePath(extension);
    const storageRootDir = this.getStorageRootDir();
    const absolutePath = buildStaticAssetAbsolutePath(storageRootDir, storagePath);
    const hash = createHash('sha256').update(buffer).digest('hex');
    const size = Number(file?.size ?? buffer.length);

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, buffer);

    try {
      const saved = await this.staticAssetsRepository.save(
        this.staticAssetsRepository.create({
          name: displayName,
          originalName,
          fileType: inferStaticAssetFileType(mimeType, extension),
          extension,
          mimeType,
          size,
          folder: this.normalizeNullableText(dto.folder, 120),
          storagePath,
          hash,
          remark: this.normalizeNullableText(dto.remark, 255),
        }),
      );

      return this.toDetail(saved);
    } catch (error) {
      await unlink(absolutePath).catch(() => undefined);
      throw error;
    }
  }

  async update(id: string, dto: UpdateStaticAssetDto) {
    const item = await this.findOneOrFail(id);
    const nextName = dto.name?.trim();

    if (dto.name !== undefined && !nextName) {
      throw new BadRequestException('资源名称不能为空');
    }

    const saved = await this.staticAssetsRepository.save({
      ...item,
      name: nextName ?? item.name,
      folder: dto.folder === undefined ? item.folder : this.normalizeNullableText(dto.folder, 120),
      remark: dto.remark === undefined ? item.remark : this.normalizeNullableText(dto.remark, 255),
    });

    return this.toDetail(saved);
  }

  async remove(id: string) {
    const item = await this.findOneOrFail(id);
    await this.staticAssetsRepository.softDelete(id);
    await this.deletePhysicalFile(item.storagePath);

    return { message: '删除成功' };
  }

  async batchRemove(dto: BatchDeleteStaticAssetsDto) {
    const ids = Array.from(new Set(dto.ids));
    const items = await this.staticAssetsRepository.find({
      where: { id: In(ids) },
    });

    if (items.length === 0) {
      throw new NotFoundException('未找到可删除的静态资源');
    }

    const foundIds = new Set(items.map((item) => item.id));
    const missingIds = ids.filter((id) => !foundIds.has(id));
    const deletedIds = items.map((item) => item.id);

    await this.staticAssetsRepository.softDelete(deletedIds);
    await Promise.all(items.map((item) => this.deletePhysicalFile(item.storagePath)));

    return {
      message: missingIds.length
        ? `批量删除完成，成功删除 ${deletedIds.length} 条静态资源，${missingIds.length} 条记录不存在`
        : `批量删除完成，成功删除 ${deletedIds.length} 条静态资源`,
      requestedCount: ids.length,
      deletedCount: deletedIds.length,
      ids: deletedIds,
      missingIds,
    };
  }

  private async findOneOrFail(id: string) {
    const item = await this.staticAssetsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('静态资源不存在');
    }
    return item;
  }

  private toDetail(item: StaticAsset): StaticAssetDetailDto {
    const routePrefix = this.getRoutePrefix();
    const publicBaseUrl = this.getPublicBaseUrl();

    return {
      id: item.id,
      name: item.name,
      originalName: item.originalName,
      fileType: item.fileType,
      extension: item.extension,
      mimeType: item.mimeType,
      size: item.size,
      folder: item.folder,
      storagePath: item.storagePath,
      accessPath: buildStaticAssetAccessPath(item.storagePath, routePrefix),
      accessUrl: buildStaticAssetAccessUrl(item.storagePath, routePrefix, publicBaseUrl),
      hash: item.hash,
      remark: item.remark,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private async deletePhysicalFile(storagePath: string) {
    const absolutePath = buildStaticAssetAbsolutePath(this.getStorageRootDir(), storagePath);
    await unlink(absolutePath).catch((error: NodeJS.ErrnoException) => {
      if (error?.code === 'ENOENT') {
        return;
      }

      this.logger.warn(`删除静态资源文件失败: ${absolutePath} (${error.message})`);
    });
  }

  private getStorageRootDir() {
    return resolveStaticAssetsRootDir(this.configService.get<string>('STATIC_ASSETS_DIR'));
  }

  private getRoutePrefix() {
    return normalizeRoutePrefix(this.configService.get<string>('STATIC_ASSETS_ROUTE_PREFIX'));
  }

  private getPublicBaseUrl() {
    return this.configService.get<string>('STATIC_ASSETS_PUBLIC_BASE_URL') ?? null;
  }

  private normalizeOriginalName(originalName?: string) {
    const normalized = originalName?.trim();
    if (!normalized) {
      return 'unnamed.bin';
    }
    return normalized.slice(0, 255);
  }

  private resolveDisplayName(
    customName: string | undefined,
    originalName: string,
    extension: string,
  ) {
    const normalized = customName?.trim();
    if (normalized) {
      return normalized.slice(0, 120);
    }

    const baseName = originalName.slice(0, 255 - extension.length - 1);
    const derivedName = baseName.endsWith(`.${extension}`)
      ? baseName.slice(0, -(extension.length + 1))
      : baseName;
    const finalName = derivedName.trim();

    return (finalName || '未命名资源').slice(0, 120);
  }

  private normalizeNullableText(value: string | undefined, maxLength: number) {
    const normalized = value?.trim();
    return normalized ? normalized.slice(0, maxLength) : null;
  }

  private normalizeFolderValue(value?: string | null) {
    const normalized = value?.trim();
    return normalized ? normalized.slice(0, 120) : null;
  }
}
