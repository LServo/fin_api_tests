import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ShowUserProfileError } from "./ShowUserProfileError"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let showUserProfileUseCase: ShowUserProfileUseCase
let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe('Show User profile Use Case', () => {
  beforeAll(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
  })

  it('Should be able to show the user profile', async () => {
    const user = await createUserUseCase.execute({
      name: 'Lucas',
      email: 'l.servo@hotmail.com',
      password: '123456'
    })

    const userProfile = await showUserProfileUseCase.execute(
      user.id
    )

    expect(userProfile).toEqual(user)
  })

  it('Should not be able to show the profile of a user what not exists', async () => {
    expect(async () => {
      await showUserProfileUseCase.execute('123456')
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})