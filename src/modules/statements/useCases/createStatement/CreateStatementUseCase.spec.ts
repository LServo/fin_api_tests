import { Statement } from "@modules/statements/entities/Statement"
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase"
import { CreateStatementError } from "./CreateStatementError"
import { CreateStatementUseCase } from "./CreateStatementUseCase"

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let createStatementUseCase: CreateStatementUseCase
let createUserUseCase: CreateUserUseCase
let userId: string

describe('Create Statement Use Case', () => {
  beforeAll(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)

    const {id} = await createUserUseCase.execute({
      name: 'Lucas',
      email: 'l.servo@hotmail.com',
      password: '123456'
    })

    userId = id
  })

  it('Should be able to create a new deposit', async () => {
    const statement = await createStatementUseCase.execute({
      user_id: userId,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: 'Depósito inicial'
    })

    expect(statement).toHaveProperty('id')
    expect(statement.user_id).toEqual(userId)
  })

  it("Should not be able to create a new withdraw if don't have funds", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: userId,
        type: OperationType.WITHDRAW,
        amount: 1500,
        description: 'Saque Sem Fundo'
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })

  it('Should not be able to create a new statement with inexistent user', async () => {
    expect(async () => {
      const statement = await createStatementUseCase.execute({
        user_id: 'user_test',
        type: OperationType.DEPOSIT,
        amount: 1000,
        description: 'Depósito inicial'
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })
})