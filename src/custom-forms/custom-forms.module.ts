import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomFormsController } from './custom-forms.controller';
import { CustomFormsService } from './custom-forms.service';
import { CustomForm } from './entities/custom-form.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomForm])],
  controllers: [CustomFormsController],
  providers: [CustomFormsService],
  exports: [CustomFormsService],
})
export class CustomFormsModule {}
