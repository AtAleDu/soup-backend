import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity('contests')
export class Contest {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column({ type: 'text', nullable: true })
  contestLink: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'date', nullable: true })
  startDate?: string

  @Column({ type: 'date', nullable: true })
  endDate?: string

  @Column({ type: 'text', nullable: true })
  result?: string

  @Column({ nullable: true })
  imageUrl?: string

  @Column({ default: true })
  isPublished: boolean

  @CreateDateColumn()
  createdAt: Date
}
