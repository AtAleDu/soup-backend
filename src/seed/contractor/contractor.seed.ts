import { DataSource } from 'typeorm'
import { ContractorTypeEntity } from '@entities/Contractor/contractor-type.entity'
import { CONTRACTOR_DATA } from './contractor.data'

export const seedContractor = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(ContractorTypeEntity)

  const count = await repo.count()
  if (count > 0) return

  await repo.save(CONTRACTOR_DATA)
}
