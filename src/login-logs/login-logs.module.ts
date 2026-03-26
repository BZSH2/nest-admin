import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginLog } from './entities/login-log.entity';
import { LoginLogsController } from './login-logs.controller';
import { LoginLogsService } from './login-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([LoginLog])],
  controllers: [LoginLogsController],
  providers: [LoginLogsService],
  exports: [LoginLogsService],
})
export class LoginLogsModule {}
