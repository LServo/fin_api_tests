import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository"
import { verify } from "jsonwebtoken"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"

import authConfig from '../../../../config/auth';
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let createUserUseCase: CreateUserUseCase
let authenticateUserUseCase: AuthenticateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository

interface IPayload {
  sub: string
}

describe('Authenticate User Use Case', () => {
  beforeAll(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)

    await createUserUseCase.execute({
      name: 'Lucas',
      email: 'l.servo@hotmail.com',
      password: '123456'
    })
  })

  it('Should be able to authenticate an user', async ()  => {
    const authUser = await authenticateUserUseCase.execute({
      email: 'l.servo@hotmail.com',
      password: '123456'
    })

    const { secret } = authConfig.jwt;
    const {user, token} = authUser
    const {sub: user_id} = verify(
      token,
      secret
  ) as IPayload

    expect(user).toHaveProperty('id')
    expect(user.email).toEqual('l.servo@hotmail.com')
    expect(user.name).toEqual('Lucas')
    expect(user_id).not.toBe(false)
    expect(user_id).toEqual(user.id)
  })

  it('Should not be able to authenticate an user what not exists', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'servol.@hotmail.com',
        password: '123456'
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it('Should not be able to authenticate a user with wrong password', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'l.servo@hotmail.com',
        password: '6666'
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})