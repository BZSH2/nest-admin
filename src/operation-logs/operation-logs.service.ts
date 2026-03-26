import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { QueryOperationLogDto } from './dto/query-operation-log.dto';
import { OperationLog } from './entities/operation-log.entity';

@Injectable()
export class OperationLogsService {
  private readonly logger = new Logger(OperationLogsService.name);

  constructor(
    @InjectRepository(OperationLog)
    private readonly operationLogsRepository: Repository<OperationLog>,
  ) {}

  async createLog(payload: Partial<OperationLog>) {
    try {
      const log = this.operationLogsRepository.create({
        operatorUserId: payload.operatorUserId ?? null,
        operatorPhoneNumber: payload.operatorPhoneNumber ?? null,
        moduleName: payload.moduleName ?? null,
        method: payload.method ?? 'GET',
        path: payload.path ?? '',
        statusCode: payload.statusCode ?? 200,
        durationMs: payload.durationMs ?? 0,
        ip: payload.ip ?? null,
        userAgent: payload.userAgent ?? null,
        requestSummary: payload.requestSummary ?? null,
        responseSummary: payload.responseSummary ?? null,
      });
      await this.operationLogsRepository.save(log);
    } catch (error) {
      this.logger.error(`写入操作日志失败: ${(error as Error).message}`);
    }
  }

  async findAll(query: QueryOperationLogDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const keyword = query.keyword?.trim();

    const where = keyword
      ? [
          {
            path: Like(`%${keyword}%`),
            ...(query.method ? { method: query.method.toUpperCase() } : {}),
          },
          {
            moduleName: Like(`%${keyword}%`),
            ...(query.method ? { method: query.method.toUpperCase() } : {}),
          },
          {
            operatorPhoneNumber: Like(`%${keyword}%`),
            ...(query.method ? { method: query.method.toUpperCase() } : {}),
          },
        ]
      : { ...(query.method ? { method: query.method.toUpperCase() } : {}) };

    const [items, total] = await this.operationLogsRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { items, total, page, pageSize };
  }
}
