import { NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { NewsEntity } from "@entities/News/news.entity";

export const getNewsByIdOrFail = async (
  id: string,
  manager: Repository<NewsEntity>["manager"],
) => {
  const item = await manager.findOne(NewsEntity, { where: { id } });
  if (!item) {
    throw new NotFoundException("News not found");
  }
  return item;
};

export const resetImportantNews = async (
  excludedId: string,
  manager: Repository<NewsEntity>["manager"],
) => {
  await manager
    .createQueryBuilder()
    .update(NewsEntity)
    .set({ isImportantNew: false })
    .where("isImportantNew = :isImportantNew", { isImportantNew: true })
    .andWhere("id != :excludedId", { excludedId })
    .execute();
};