import { getRepository, Repository } from "typeorm";
import { Transfer } from "../entities/Transfer";
import { ITransfersRepository } from "./ITransfersRepository";

type ICreateStatementDTO =
Pick<
  Transfer,
  'sender_id' |
  'receiver_id' |
  'amount' |
  'description' 
>

export class TransfersRepository implements ITransfersRepository {
  private repository: Repository<Transfer>
  constructor() {
    this.repository = getRepository(Transfer)
  }

  create({
    sender_id,
    receiver_id,
    amount,
    description
  }: ICreateStatementDTO): Promise<Transfer> {
    const transfer = this.repository.create({
      sender_id,
      receiver_id,
      amount,
      description
    })

    return this.repository.save(transfer)
  }
}