import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            code: 200,
            message: '请求成功',
            data: 'Hello World!',
          }),
        );
      });
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            code: 200,
            message: '请求成功',
            data: expect.objectContaining({
              status: 'ok',
              timestamp: expect.any(String),
              uptime: expect.any(Number),
            }),
          }),
        );
      });
  });

  it('/health/live (GET)', () => {
    return request(app.getHttpServer())
      .get('/health/live')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toEqual(
          expect.objectContaining({
            status: 'ok',
            timestamp: expect.any(String),
            uptime: expect.any(Number),
          }),
        );
      });
  });

  it('/health/ready (GET)', () => {
    return request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toEqual(
          expect.objectContaining({
            status: 'ok',
            timestamp: expect.any(String),
            uptime: expect.any(Number),
          }),
        );
      });
  });
});
