import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,} from "typeorm";
@Entity("news")
export class NewsEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  image: string;

  @Column()
  imageAlt: string;

  @Column()
  category: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  // PostgreSQL only
  @Column({ type: "text", array: true, nullable: true })
  content?: string[];

  @Column({ default: false })
  isAds?: boolean;

  @Column({ default: false })
  isImportantNew?: boolean;
}
