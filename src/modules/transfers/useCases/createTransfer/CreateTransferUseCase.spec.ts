import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository"

let inMemoryStatementsRepository: InMemoryStatementsRepository

describe('Create Transfer use Case', () => {
  beforeAll(async () => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
  })

  it('Should be able to create a new transfer')

  it('Should not be able to create a new transfer if sender_id is invalid')
  it('Should not be able to create a new transfer if receiver_id is invalid')

  it('Should not be able to create a new transfer if the amount is invalid')
  // is zero, negative or the sender has an insufficient funds

  it('Should be able to save a new transfer in database')
})