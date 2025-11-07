import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true, type: 'varchar' })
  username: string

  @Column({ type: 'varchar', nullable: true })
  email?: string

  @Column({ type: 'varchar', default: 'user' })
  role: string

  @Column({ type: 'varchar', nullable: true })
  avatar_url?: string

  @CreateDateColumn({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  updatedAt: Date
}
