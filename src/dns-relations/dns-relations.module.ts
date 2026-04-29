import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnsRelationsController } from './dns-relations.controller';
import { DnsRelationsService } from './dns-relations.service';
import { DnsRelation } from './entities/dns-relation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DnsRelation])],
  controllers: [DnsRelationsController],
  providers: [DnsRelationsService],
  exports: [DnsRelationsService],
})
export class DnsRelationsModule {}
