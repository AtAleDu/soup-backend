import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from "typeorm";
import { Blog } from "../Blog/blog.entity";
import { User } from "../User/user.entity";

@Entity("blog_likes")
@Unique(["blogId", "userId"])
export class BlogLike {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "blog_id", type: "uuid" })
  blogId: string;

  @Column({ name: "user_id", type: "uuid" })
  userId: string;

  @ManyToOne(() => Blog, { onDelete: "CASCADE" })
  @JoinColumn({ name: "blog_id" })
  blog: Blog;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;
}
