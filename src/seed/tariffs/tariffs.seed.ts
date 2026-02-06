import { DataSource } from "typeorm";
import { Tariff } from "@entities/Tarif/tariff.entity";
import { TARIFF_DATA } from "./tariffs.data";

export async function seedTariffs(dataSource: DataSource) {
  const repo = dataSource.getRepository(Tariff);

  for (const data of TARIFF_DATA) {
    const existing = await repo.findOne({ where: { name: data.name } });
    if (existing) {
      await repo.update({ id: existing.id }, data);
    } else {
      await repo.save(data);
    }
  }
}
