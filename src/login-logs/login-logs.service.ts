import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { QueryLoginLogDto } from './dto/query-login-log.dto';
import { LoginLog } from './entities/login-log.entity';

@Injectable()
export class LoginLogsService {
  constructor(
    @InjectRepository(LoginLog)
    private readonly loginLogsRepository: Repository<LoginLog>,
  ) {}

  async createLog(payload: Partial<LoginLog>) {
    const log = this.loginLogsRepository.create({
      userId: payload.userId ?? null,
      phoneNumber: payload.phoneNumber ?? '',
      success: payload.success ?? false,
      ip: payload.ip ?? null,
      userAgent: payload.userAgent ?? null,
      failureReason: payload.failureReason ?? null,
    });
    return await this.loginLogsRepository.save(log);
  }

  async findAll(query: QueryLoginLogDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const keyword = query.keyword?.trim();

    const where = keyword
      ? [
          {
            phoneNumber: Like(`%${keyword}%`),
            ...(query.success == null ? {} : { success: query.success }),
          },
          {
            ip: Like(`%${keyword}%`),
            ...(query.success == null ? {} : { success: query.success }),
          },
        ]
      : { ...(query.success == null ? {} : { success: query.success }) };

    const [items, total] = await this.loginLogsRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { items, total, page, pageSize };
  }
}
