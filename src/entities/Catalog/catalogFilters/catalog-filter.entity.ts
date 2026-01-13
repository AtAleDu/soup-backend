import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('catalog_filter')
export class CatalogFilter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string;

  @Column()
  item: string;
}
