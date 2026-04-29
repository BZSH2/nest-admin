import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaticAsset } from './entities/static-asset.entity';
import { StaticAssetsController } from './static-assets.controller';
import { StaticAssetsService } from './static-assets.service';

@Module({
  imports: [TypeOrmModule.forFeature([StaticAsset])],
  controllers: [StaticAssetsController],
  providers: [StaticAssetsService],
  exports: [StaticAssetsService],
})
export class StaticAssetsModule {}
