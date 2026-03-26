import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../auth/enums/user-role.enum';
import { ApiModule } from '../common/decorators/api-module.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { QueryLoginLogDto } from './dto/query-login-log.dto';
import { LoginLogsService } from './login-logs.service';

@ApiTags('LoginLogs')
@Controller('login-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class LoginLogsController {
  constructor(private readonly loginLogsService: LoginLogsService) {}

  @Get()
  @ApiModule('LoginLogModule')
  @ApiOperation({ summary: '分页查询登录日志' })
  findAll(@Query() query: QueryLoginLogDto) {
    return this.loginLogsService.findAll(query);
  }
}
