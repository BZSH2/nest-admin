import { PartialType } from '@nestjs/swagger';
import { CreateCustomFormDto } from './create-custom-form.dto';

export class UpdateCustomFormDto extends PartialType(CreateCustomFormDto) {}
