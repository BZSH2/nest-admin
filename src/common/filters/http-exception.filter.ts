import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const raw =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error';
    const fallbackMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: '请求参数错误',
      [HttpStatus.UNAUTHORIZED]: '未授权',
      [HttpStatus.FORBIDDEN]: '禁止访问',
      [HttpStatus.NOT_FOUND]: '资源未找到',
      [HttpStatus.METHOD_NOT_ALLOWED]: '方法不允许',
      [HttpStatus.CONFLICT]: '资源冲突',
      [HttpStatus.UNPROCESSABLE_ENTITY]: '请求无法处理',
      [HttpStatus.INTERNAL_SERVER_ERROR]: '服务器内部错误',
      [HttpStatus.BAD_GATEWAY]: '网关错误',
      [HttpStatus.SERVICE_UNAVAILABLE]: '服务不可用',
      [HttpStatus.GATEWAY_TIMEOUT]: '网关超时',
    };
    const translate = (msg: string) => {
      let r = msg;
      r = r.replace(/^property\s+(\w+)/i, '字段 $1');
      r = r.replace(/should not exist/i, '不允许存在');
      r = r.replace(/must be a string/i, '必须为字符串');
      r = r.replace(/must be a number(.*)/i, '必须为数字$1');
      r = r.replace(/should not be empty/i, '不能为空');
      r = r.replace(/must be an email/i, '必须为有效邮箱');
      r = r.replace(/must be a boolean/i, '必须为布尔值');
      r = r.replace(/must be an array/i, '必须为数组');
      r = r.replace(/must be a date string/i, '必须为日期字符串');
      r = r.replace(/bad request/i, '请求参数错误');
      return r;
    };
    const resolved =
      typeof raw === 'string'
        ? translate(raw)
        : Array.isArray((raw as any)?.message)
          ? ((raw as any).message as string[]).map(translate).join('；')
          : translate(
              (raw as any)?.message || (raw as any)?.error || fallbackMap[status] || '请求失败',
            );

    this.logger.error(`Http Status: ${status} Error Message: ${JSON.stringify(resolved)}`);

    response.status(status).json({
      code: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: resolved,
    });
  }
}
