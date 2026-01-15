import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CatalogFilter } from "@entities/Catalog/catalogFilters/catalog-filter.entity";

type CatalogFilterGroup = {
  category: string;
  items: string[];
};

@Injectable()
export class CatalogFiltersService {
  constructor(
    @InjectRepository(CatalogFilter)
    private readonly repo: Repository<CatalogFilter>,
  ) {}

  async findAll(): Promise<CatalogFilterGroup[]> {
    const rows = await this.repo.find({
      order: { category: "ASC", item: "ASC" },
    });

    const grouped = new Map<string, string[]>();
    rows.forEach((row) => {
      if (!grouped.has(row.category)) {
        grouped.set(row.category, []);
      }
      grouped.get(row.category)!.push(row.item);
    });

    return Array.from(grouped.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }
}
