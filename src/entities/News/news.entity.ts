import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('news')
export class NewsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  image: string;

  @Column()
  imageAlt: string;

  @Column()
  category: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  date?: string;

  // MySQL не поддерживает array — работает только в Postgres
  @Column({ type: 'text', array: true, nullable: true })
  content?: string[];

  @Column({ default: false })
  isAds?: boolean;

  @Column({ default: false })
  isImportantNew?: boolean;
}
