import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from "./CreateUserError"
import { CreateUserUseCase } from "./CreateUserUseCase"

let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository

describe('Create User Use Case', () => {
  beforeAll(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it('Should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'Lucas',
      email: 'l.servo@hotmail.com',
      password: '123456'
    })
    expect(user).toHaveProperty('id')
    expect(user.name).toEqual('Lucas')
    expect(user.email).toEqual('l.servo@hotmail.com')
  })

  it('Should not be able to create a user that already exists', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'Lucas',
        email: 'l.servo@hotmail.com',
        password: '123456'
      })
    }).rejects.toBeInstanceOf(CreateUserError)
  })

  it('Should be able to encrypt the user password', async () => {
    const user = await createUserUseCase.execute({
      name: 'Lucas Servo',
      email: 'l.servo2@hotmail.com',
      password: '123456'
    })
    expect(user.password).not.toEqual('123456')
  })
})