import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  DOER = 'doer',
  CLIENT = 'client',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.DOER,
  })
  role: UserRole;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  refreshTokenHash: string | null;
}
