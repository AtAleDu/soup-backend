import { DataSource } from 'typeorm'
import { ContractorTypeEntity } from '@entities/Contractor/contractor-categories.entity'
import { ContractorSubcategoryEntity } from '@entities/Contractor/contractor-subcategory.entity'
import { CONTRACTOR_DATA } from './contractor.data'

export const seedContractor = async (dataSource: DataSource) => {
  await dataSource.query('DROP TABLE IF EXISTS "contractor" CASCADE')

  const repo = dataSource.getRepository(ContractorTypeEntity)
  const subcategoryRepo = dataSource.getRepository(ContractorSubcategoryEntity)
  const existingCategories = await repo.find({ relations: { subcategories: true } })
  const byTitle = new Map(existingCategories.map((category) => [category.title, category]))

  for (const seedCategory of CONTRACTOR_DATA) {
    const existing = byTitle.get(seedCategory.title)

    if (!existing) {
      await repo.save({
        title: seedCategory.title,
        logoUrl: seedCategory.logoUrl,
        subcategories: seedCategory.subcategories,
      })
      continue
    }

    const subcategoriesByTitle = new Map(
      (existing.subcategories ?? []).map((subcategory) => [subcategory.title, subcategory]),
    )

    existing.logoUrl = seedCategory.logoUrl
    existing.subcategories = seedCategory.subcategories.map((seedSubcategory) => {
      const matched = subcategoriesByTitle.get(seedSubcategory.title)
      if (!matched) {
        return subcategoryRepo.create({
          title: seedSubcategory.title,
          logoUrl: seedSubcategory.logoUrl,
          imageUrl: seedSubcategory.imageUrl,
        })
      }

      matched.logoUrl = seedSubcategory.logoUrl
      matched.imageUrl = seedSubcategory.imageUrl
      return matched
    })

    await repo.save(existing)
  }
}
