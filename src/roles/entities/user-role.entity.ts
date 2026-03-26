import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
@Unique(['userId', 'roleId'])
export class UserRoleAssignment {
  @PrimaryGeneratedColumn('uuid', { comment: '用户角色关系ID' })
  id: string;

  @Column('uuid', { comment: '用户ID' })
  userId: string;

  @Column('uuid', { comment: '角色ID' })
  roleId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
