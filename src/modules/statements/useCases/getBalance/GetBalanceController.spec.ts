import { app } from "@src/app"
import { hash } from "bcryptjs"
import request from 'supertest'
import { Connection, createConnection } from "typeorm"
import { v4 as uuid } from 'uuid'

let connection: Connection
let userId: string
let token: string

describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    const passwordHash = await hash('123456', 8)
    userId = uuid()

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${userId}', 'Lucas', 'l.servo@hotmail.com', '${passwordHash}', 'now()', 'now()')`
      )

    const authenticate = await request(app).post('/api/v1/sessions').send({
      email: 'l.servo@hotmail.com',
      password: '123456'
    })

    token = authenticate.body.token

    await request(app).post('/api/v1/statements/deposit').send({
      amount: 900.00,
      description: 'Initial Deposit'
    }).set({
      Authorization: `Bearer ${token}`
    })
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('Should be able to get balance of a user with bearer token authentication', async () => {
    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${token}`
    })
    expect(response.status).toBe(200)
  })

  it('Should not be able to get balance of a user with bearer token authentication if the token is invalid', async () => {
    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer token`
    })

    expect(response.status).toBe(401)
  })
})