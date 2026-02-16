import { DataSource } from "typeorm";
import { Blog } from "../../entities/Blog/blog.entity";
import { Company } from "../../entities/Company/company.entity";
import { BLOG_DATA } from "./blog.data";

export async function seedBlog(dataSource: DataSource) {
  const companyRepo = dataSource.getRepository(Company);
  const blogRepo = dataSource.getRepository(Blog);

  const company = await companyRepo.findOne({ where: {}, order: { companyId: "ASC" } });
  if (!company) {
    console.warn("Blog seed skipped: no company found. Create a company (e.g. via registration) first.");
    return;
  }

  await dataSource.query('TRUNCATE TABLE "blogs" CASCADE');

  const blogs = BLOG_DATA.map((item) =>
    blogRepo.create({
      companyId: company.companyId,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      contentBlocks: item.contentBlocks ?? null,
      status: item.status,
      isPinned: item.isPinned ?? false,
    }),
  );

  await blogRepo.save(blogs);
}
