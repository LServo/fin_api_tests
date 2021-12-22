import { app } from "@src/app";
import { hash } from "bcryptjs";
import { verify } from "jsonwebtoken";
import request from 'supertest'
import { Connection, createConnection } from "typeorm";
import { v4 as uuid } from 'uuid'
import authConfig from '../../../../config/auth'

interface IPayload {
  sub: string
}

let connection: Connection
let userId: string

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    userId = uuid()
    const passwordHash = await hash('123456', 8)

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${userId}', 'Lucas', 'l.servo@hotmail.com', '${passwordHash}', 'now()', 'now()')`
      )
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('Should be able to authenticate an user and return a valid token', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'l.servo@hotmail.com',
      password: '123456'
    })

    const { secret } = authConfig.jwt
    const { user, token } = response.body
    const { sub: user_id } = verify(token, secret) as IPayload

    expect(response.status).toBe(200)
    expect(response.body.user.id).toEqual(userId)
    expect(user_id).not.toBe(false)
    expect(user_id).toEqual(user.id)
    expect(user_id).toEqual(userId)
    expect(user_id).toEqual(response.body.user.id)
  })

  it ('Should not be able to authenticate an user with invalid user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'test',
      password: '123456'
    })

    expect(response.status).toBe(401)
  })

  it ('Should not be able to authenticate an user with invalid password', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'l.servo@hotmail.com',
      password: 'test'
    })

    expect(response.status).toBe(401)
  })
})