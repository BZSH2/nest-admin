import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Menu } from './entities/menu.entity';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, Product])],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
