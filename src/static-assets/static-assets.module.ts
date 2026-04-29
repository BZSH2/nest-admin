import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaticAssetsController } from './static-assets.controller';
import { StaticAssetsService } from './static-assets.service';
import { StaticAsset } from './entities/static-asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StaticAsset])],
  controllers: [StaticAssetsController],
  providers: [StaticAssetsService],
  exports: [StaticAssetsService],
})
export class StaticAssetsModule {}
