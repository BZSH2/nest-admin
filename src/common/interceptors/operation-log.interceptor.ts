import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request } from 'express';
import { catchError, Observable, tap, throwError } from 'rxjs';
import type { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { OperationLogsService } from '../../operation-logs/operation-logs.service';

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(private readonly operationLogsService: OperationLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse();
    const start = Date.now();
    const shouldLog = this.shouldLog(request);

    if (!shouldLog) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        void this.operationLogsService.createLog({
          operatorUserId: request.user?.id ?? null,
          operatorPhoneNumber: request.user?.phoneNumber ?? null,
          moduleName: this.resolveModuleName(request),
          method: request.method,
          path: request.originalUrl || request.url,
          statusCode: response.statusCode,
          durationMs: Date.now() - start,
          ip: this.resolveIp(request),
          userAgent: request.get?.('user-agent') ?? null,
          requestSummary: this.stringifySummary({ query: request.query, body: request.body }),
          responseSummary: this.stringifySummary(data),
        });
      }),
      catchError((error) => {
        void this.operationLogsService.createLog({
          operatorUserId: request.user?.id ?? null,
          operatorPhoneNumber: request.user?.phoneNumber ?? null,
          moduleName: this.resolveModuleName(request),
          method: request.method,
          path: request.originalUrl || request.url,
          statusCode: typeof error?.status === 'number' ? error.status : 500,
          durationMs: Date.now() - start,
          ip: this.resolveIp(request),
          userAgent: request.get?.('user-agent') ?? null,
          requestSummary: this.stringifySummary({ query: request.query, body: request.body }),
          responseSummary: this.stringifySummary({ message: error?.message ?? '请求失败' }),
        });
        return throwError(() => error);
      }),
    );
  }

  private shouldLog(request: Request) {
    const method = request.method.toUpperCase();
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return false;
    }

    const path = request.originalUrl || request.url;
    if (path.includes('/auth/login') || path.includes('/auth/refresh')) {
      return false;
    }

    return path.startsWith('/api/');
  }

  private resolveModuleName(request: Request) {
    const path = (request.originalUrl || request.url).replace(/^\/api\/?/, '');
    return path.split('/')[0] || 'unknown';
  }

  private resolveIp(request: Request) {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return request.ip ?? null;
  }

  private stringifySummary(payload: unknown) {
    if (payload == null) return null;
    try {
      return JSON.stringify(payload).slice(0, 1000);
    } catch {
      return '[unserializable]';
    }
  }
}
