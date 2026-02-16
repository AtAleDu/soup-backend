import { EntityManager } from "typeorm";
import { Blog } from "@entities/Blog/blog.entity";

export const resetPinnedBlog = async (excludedId: string, manager: EntityManager) => {
  await manager
    .createQueryBuilder()
    .update(Blog)
    .set({ isPinned: false })
    .where("isPinned = :isPinned", { isPinned: true })
    .andWhere("id != :excludedId", { excludedId })
    .execute();
};

export const resetPinnedByCompanyBlog = async (
  companyId: number,
  excludedId: string,
  manager: EntityManager,
) => {
  await manager
    .createQueryBuilder()
    .update(Blog)
    .set({ pinnedByCompany: false })
    .where("pinnedByCompany = :pinnedByCompany", { pinnedByCompany: true })
    .andWhere("companyId = :companyId", { companyId })
    .andWhere("id != :excludedId", { excludedId })
    .execute();
};