import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthOrPublicGuard } from './common/guards/auth-or-public.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { OperationLogInterceptor } from './common/interceptors/operation-log.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import databaseConfig from './config/database.config';
import { validateEnv } from './config/env.validation';
import { CustomFormsModule } from './custom-forms/custom-forms.module';
import { DnsRelationsModule } from './dns-relations/dns-relations.module';
import { LoginLogsModule } from './login-logs/login-logs.module';
import { MenusModule } from './menus/menus.module';
import { OpenApiModule } from './openapi/openapi.module';
import { OperationLogsModule } from './operation-logs/operation-logs.module';
import { RolesModule } from './roles/roles.module';
import { StaticAssetsModule } from './static-assets/static-assets.module';
import { SystemConfigsModule } from './system-configs/system-configs.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validate: validateEnv,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
    }),
    UsersModule,
    AuthModule,
    OpenApiModule,
    RolesModule,
    MenusModule,
    SystemConfigsModule,
    DnsRelationsModule,
    StaticAssetsModule,
    CustomFormsModule,
    LoginLogsModule,
    OperationLogsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthOrPublicGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: OperationLogInterceptor },
  ],
})
export class AppModule {}
