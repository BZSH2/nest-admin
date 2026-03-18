import { Injectable, Optional, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { DataSource } from 'typeorm';

export interface HealthStatus {
  status: 'ok';
  timestamp: string;
  uptime: number;
  checks?: {
    database: 'up' | 'skipped';
  };
}

@Injectable()
export class AppService {
  constructor(@Optional() @InjectDataSource() private readonly dataSource?: DataSource) {}

  getHello(): string {
    return 'Hello World!';
  }

  getLiveness(): HealthStatus {
    return this.createBaseHealthStatus();
  }

  async getReadiness(): Promise<HealthStatus> {
    const status = this.createBaseHealthStatus();

    if (!this.dataSource) {
      return {
        ...status,
        checks: {
          database: 'skipped',
        },
      };
    }

    if (!this.dataSource.isInitialized) {
      throw new ServiceUnavailableException('数据库未就绪');
    }

    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException('数据库未就绪');
    }

    return {
      ...status,
      checks: {
        database: 'up',
      },
    };
  }

  private createBaseHealthStatus(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }
}
