import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CatalogFilter } from '@entities/Catalog/catalogFilters/catalog-filter.entity'
import { CatalogFiltersController } from './catalog-filters.controller'
import { CatalogFiltersService } from './catalog-filters.service'
import { AdminCatalogFiltersController } from './admin/admin-catalog-filters.controller'
import { AdminCatalogFiltersService } from './admin/admin-catalog-filters.service'
@Module({
  imports: [TypeOrmModule.forFeature([CatalogFilter])],
  controllers: [CatalogFiltersController, AdminCatalogFiltersController],
  providers: [CatalogFiltersService, AdminCatalogFiltersService],
})
export class CatalogFiltersModule {}
