import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../auth/enums/user-role.enum';
import { ApiModule } from '../common/decorators/api-module.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { QueryOperationLogDto } from './dto/query-operation-log.dto';
import { OperationLogsService } from './operation-logs.service';

@ApiTags('OperationLogs')
@Controller('operation-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class OperationLogsController {
  constructor(private readonly operationLogsService: OperationLogsService) {}

  @Get()
  @ApiModule('OperationLogModule')
  @ApiOperation({ summary: '分页查询操作日志' })
  findAll(@Query() query: QueryOperationLogDto) {
    return this.operationLogsService.findAll(query);
  }
}
