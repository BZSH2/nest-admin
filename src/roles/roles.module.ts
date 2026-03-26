import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { Role } from './entities/role.entity';
import { UserRoleAssignment } from './entities/user-role.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesBootstrapService } from './roles-bootstrap.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, UserRoleAssignment, User]), UsersModule],
  controllers: [RolesController],
  providers: [RolesService, RolesBootstrapService],
  exports: [RolesService],
})
export class RolesModule {}
