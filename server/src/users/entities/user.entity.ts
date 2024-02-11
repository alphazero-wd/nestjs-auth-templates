import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string;

  @Column({ unique: true, name: 'username' })
  @Field(() => String)
  username!: string;

  @Column({ unique: true, name: 'email' })
  @Field(() => String)
  email!: string;

  @Column()
  password!: string;

  @CreateDateColumn()
  @Field(() => Date)
  joinedAt: Date;

  @Column({ nullable: true })
  refreshToken?: string;
}
