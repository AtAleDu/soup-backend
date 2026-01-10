import { DataSource } from 'typeorm';
import { NewsEntity } from '../../entities/News/news.entity';
import { NEWS_DATA } from './news.data';

export async function seedNews(dataSource: DataSource) {
  const repo = dataSource.getRepository(NewsEntity);

  await repo.clear();
  await repo.save(NEWS_DATA);
}
