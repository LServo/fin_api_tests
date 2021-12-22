import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetBalanceError } from "./GetBalanceError"
import { GetBalanceUseCase } from "./GetBalanceUseCase"

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let getBalanceUseCase: GetBalanceUseCase
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository

let userId: string
let userAmount: number
let statementId: string

describe('Get Balance Use Case', () => {
  beforeAll(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)

    const newUser = await createUserUseCase.execute({
      name: 'Lucas Servo',
      email: 'l.servo@hotmail.com',
      password: '123456'
    })

    const statement = await createStatementUseCase.execute({
      user_id: newUser.id,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: 'Depósito inicial'
    })

    userId = newUser.id
    userAmount = statement.amount
    statementId = statement.id
  })

  it('Should be able to get balance', async () => {
    const statement = await getBalanceUseCase.execute({user_id: userId})

    expect(statement.statement[0]).toHaveProperty('id')

    expect(statement.balance).toEqual(userAmount)
    expect(statement.statement[0].id).toEqual(statementId)
    expect(statement.statement[0].user_id).toEqual(userId)
    expect(statement.statement[0].amount).toEqual(userAmount)
  })

  it('Should not be able to get a balance of a user what not exists', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({user_id: '123456'})
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})