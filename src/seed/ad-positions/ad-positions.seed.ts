import { DataSource } from "typeorm";
import { AdPosition } from "@entities/Ad/ad-position.entity";
import { AD_POSITIONS_DATA } from "./ad-positions.data";

export async function seedAdPositions(dataSource: DataSource) {
  const repo = dataSource.getRepository(AdPosition);

  for (const data of AD_POSITIONS_DATA) {
    const existing = await repo.findOne({ where: { code: data.code } });
    if (existing) {
      await repo.update({ id: existing.id }, data);
    } else {
      await repo.save(data);
    }
  }
}

