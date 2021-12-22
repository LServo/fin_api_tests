import { app } from "@src/app"
import { hash } from "bcryptjs"
import request from 'supertest'
import { Connection, createConnection } from "typeorm"
import { v4 as uuid } from 'uuid'

let connection: Connection
let userId: string
let token: string

describe('Create Statement Controller', () => {
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
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('Should be able to create statement (deposit) with an authenticated user', async () => {
    const response = await request(app).post('/api/v1/statements/deposit').send({
      amount: 900.00,
      description: 'Initial Deposit',
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(201)
    expect(response.body.user_id).toEqual(userId)
  })

  it('Should be able to create statement (withdraw) with an authenticated user', async () => {
    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 450.00,
      description: 'Withdraw half',
    }).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(201)
    expect(response.body.user_id).toEqual(userId)
  })

  it('Should not be able to create statement (withdraw) if the funds are Insufficient', async () => {
    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 500.00,
      description: 'Insufficient funds'
    }).set({
      Authorization: `Bearer ${token}`
    })
    
    expect(response.status).toBe(400)
  })

  it('Should not be able to create statement (deposit) if the token is missing', async () => {
    const response = await request(app).post('/api/v1/statements/deposit').send({
      amount: 900.00,
      description: 'Invalid Token'
    })

    expect(response.status).toBe(401)
  })
})