import { DataSource } from 'typeorm';
import { CONTEST_DATA } from './contest.data';
import { Contest } from '@entities/Contest/contest.entity';

export async function seedContest(dataSource: DataSource) {
  const repo = dataSource.getRepository(Contest);

  await repo.clear();
  await repo.save(CONTEST_DATA);
}
