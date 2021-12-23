import { Connection, createConnection } from "typeorm"
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { hash } from "bcryptjs"
import { app } from "@src/app"

let connection: Connection
let statementId: string
let userId: string
let token: string

describe('Get Statement Operation Controller', () => {
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

    const statement = await request(app).post('/api/v1/statements/deposit').send({
      amount: 900.00,
      description: 'Initial Deposit'
    }).set({
      Authorization: `Bearer ${token}`
    })
    
    statementId = statement.body.id
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('Should be able to get statement operation with token an statement id on route params', async () => {
    const response = await request(app).get(`/api/v1/statements/${statementId}`).set({
      Authorization: `Bearer ${token}`
    })
    expect(response.status).toBe(200)
    expect(response.body.id).toEqual(statementId)
  })

  it('Should not be able to get an statement operation with invalid token', async () => {
    const response = await request(app).get(`/api/v1/statements/${statementId}`).set({
      Authorization: 'Bearer Token'
    })

    expect(response.status).toBe(401)
  })

  it('Should not be able to get an statement operation with invalid statement id', async () => {
    const response = await request(app).get('/api/v1/statements/94a1d7ee-e152-4511-83fa-6031eb9b0a7b').set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(404)
  })
})