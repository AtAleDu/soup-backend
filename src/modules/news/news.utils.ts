import { NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { NewsEntity } from "@entities/News/news.entity";
import { RevalidationService } from "@infrastructure/revalidation/revalidation.service";

export const getNewsByIdOrFail = async (
  id: string,
  manager: Repository<NewsEntity>["manager"],
) => {
  // Единый способ получить новость
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
  // Снимаем закрепление у всех, кроме выбранной
  await manager
    .createQueryBuilder()
    .update(NewsEntity)
    .set({ isImportantNew: false })
    .where("isImportantNew = :isImportantNew", { isImportantNew: true })
    .andWhere("id != :excludedId", { excludedId })
    .execute();
};

export const revalidateNewsPages = async (
  revalidationService: RevalidationService,
  id?: string,
) => {
  // Обновляем кеш новостных страниц
  await revalidationService.revalidate("/news");
  await revalidationService.revalidate("/");
  if (id) {
    await revalidationService.revalidate(`/news/${id}`);
  }
};