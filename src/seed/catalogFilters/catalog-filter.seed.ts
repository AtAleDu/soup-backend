import { DataSource } from 'typeorm';
import { CatalogFilter } from '@entities/Catalog/catalogFilters/catalog-filter.entity';
import { CATALOG_FILTER_DATA } from './catalog-filter.data';

export async function seedCatalogFilter(dataSource: DataSource) {
  const repo = dataSource.getRepository(CatalogFilter);

  await repo.clear();
  await repo.save(CATALOG_FILTER_DATA);
}
