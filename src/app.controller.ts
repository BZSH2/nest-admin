import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(@Inject(AppService) private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  health() {
    return this.appService.getLiveness();
  }

  @Public()
  @Get('health/live')
  live() {
    return this.appService.getLiveness();
  }

  @Public()
  @Get('health/ready')
  ready() {
    return this.appService.getReadiness();
  }
}
