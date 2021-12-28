import { IStatementsRepository } from "../../../../modules/statements/repositories/IStatementsRepository"
import { Transfer } from "../../../../modules/transfers/entities/Transfer"
import { ITransfersRepository } from "../../../../modules/transfers/repositories/ITransfersRepository"
import { IUsersRepository } from "../../../../modules/users/repositories/IUsersRepository"
import { AppError } from "../../../../shared/errors/AppError"
import { inject, injectable } from "tsyringe"

type ICreateStatementDTO =
Pick<
  Transfer,
  'sender_id' |
  'receiver_id' |
  'amount' |
  'description'
>
enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('TransfersRepository')
    private transfersRepository: ITransfersRepository,
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}
  async execute({ 
    sender_id, 
    receiver_id, 
    amount, 
    description }:ICreateStatementDTO): Promise<Transfer> {
      const sender = await this.usersRepository.findById(sender_id)
      const receiver = await this.usersRepository.findById(receiver_id)

      if (!sender) {
        throw new AppError('Sender does not exists!')
      }

      if (!receiver) {
        throw new AppError('Receiver does not exists!')
      }

      const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id })

      if (balance < amount) {
        throw new AppError('Insufficient Funds!')
      }

      await this.statementsRepository.create({
        user_id: sender_id,
        amount,
        description,
        type: OperationType.WITHDRAW
      })

      await this.statementsRepository.create({
        user_id: receiver_id,
        amount,
        description,
        type: OperationType.DEPOSIT
      })

      const newTransfer = await this.transfersRepository.create({
        sender_id,
        receiver_id,
        amount,
        description
      })

      return newTransfer
  }
}

export { CreateTransferUseCase }