import { RevalidationService } from "@infrastructure/revalidation/revalidation.service";

export const revalidateBlogPages = async (
  revalidationService: RevalidationService,
  id?: string,
) => {
  await revalidationService.revalidate("/blogs");
  await revalidationService.revalidate("/");
  if (id) {
    await revalidationService.revalidate(`/blogs/${id}`);
  }
};