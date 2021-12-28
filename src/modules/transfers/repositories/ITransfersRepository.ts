import { Transfer } from "../entities/Transfer";

interface IRequest {
  sender_id: string
  receiver_id: string
  amount: number
  description: string
}

export interface ITransfersRepository {
  create(data: IRequest): Promise<Transfer>
}