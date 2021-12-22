import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase"
import { rejects } from "assert"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetStatementOperationError } from "./GetStatementOperationError"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let getStatementOperationUseCase: GetStatementOperationUseCase
let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository

let userId: string
let statementId: string

describe('Get Statement Operation Use Case', () => {
  beforeAll(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)

    const user = await createUserUseCase.execute({
      name: 'Lucas Servo',
      email: 'l.servo@hotmail.com',
      password: '123456'
    })

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: 'Initial Statement'
    })

    userId = user.id
    statementId = statement.id
  })

  it("Should be able to get an statement by id's", async () => {
    const getStatement = await getStatementOperationUseCase.execute({
      user_id: userId,
      statement_id: statementId
    })

    expect(getStatement).toHaveProperty('id')
    expect(getStatement.id).toEqual(statementId)
    expect(getStatement.user_id).toEqual(userId)
  })

  it('Should not be able to get an statement with wrong user id', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: '123456',
        statement_id: statementId
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it('Should not be able to get an statement with wrong statement id', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: userId,
        statement_id: '123456'
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})