import { User } from '../../../modules/users/entities/User'
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import {v4 as uuid} from 'uuid'

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

@Entity('transfers')
export class Transfer {
  @PrimaryColumn()
  id: string

  @ManyToOne(() => User)
  @JoinColumn([ { name: 'sender_id' }, { name: 'receiver_id' } ])
  user: User

  @Column()
  sender_id: string

  @Column()
  receiver_id: string

  @Column('decimal', { precision: 5, scale: 2 })
  amount: number

  @Column()
  description: string

  @CreateDateColumn()
  created_at: Date

  @CreateDateColumn()
  updated_at: Date

  constructor() {
    if (!this.id) {
      this.id = uuid()
    }
  }
}