import { ServiceUnavailableException } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import { AppService } from './app.service';

describe('AppService', () => {
  it('returns a liveness payload', () => {
    const service = new AppService();

    expect(service.getLiveness()).toEqual(
      expect.objectContaining({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      }),
    );
  });

  it('returns skipped readiness when datasource is not available', async () => {
    const service = new AppService();

    await expect(service.getReadiness()).resolves.toEqual(
      expect.objectContaining({
        status: 'ok',
        checks: {
          database: 'skipped',
        },
      }),
    );
  });

  it('returns healthy readiness when datasource is initialized', async () => {
    const dataSource = {
      isInitialized: true,
      query: jest.fn().mockResolvedValue([{ result: 1 }]),
    } as unknown as DataSource;
    const service = new AppService(dataSource);

    await expect(service.getReadiness()).resolves.toEqual(
      expect.objectContaining({
        status: 'ok',
        checks: {
          database: 'up',
        },
      }),
    );
    expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('throws when datasource is not initialized', async () => {
    const dataSource = {
      isInitialized: false,
      query: jest.fn(),
    } as unknown as DataSource;
    const service = new AppService(dataSource);

    await expect(service.getReadiness()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('throws when datasource query fails', async () => {
    const dataSource = {
      isInitialized: true,
      query: jest.fn().mockRejectedValue(new Error('db down')),
    } as unknown as DataSource;
    const service = new AppService(dataSource);

    await expect(service.getReadiness()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
