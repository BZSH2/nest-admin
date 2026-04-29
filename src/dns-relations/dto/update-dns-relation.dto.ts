import { PartialType } from '@nestjs/swagger';
import { CreateDnsRelationDto } from './create-dns-relation.dto';

export class UpdateDnsRelationDto extends PartialType(CreateDnsRelationDto) {}
