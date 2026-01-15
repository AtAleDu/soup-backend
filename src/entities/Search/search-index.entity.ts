import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("search_index")
export class SearchIndex {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entity_type: string; // company | article | contest

  @Column()
  entity_id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  content: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  indexed_at: Date;
}
