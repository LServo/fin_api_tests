import { hash } from "bcryptjs"
import { Connection, createConnection } from "typeorm"
import { v4 as uuid } from 'uuid'
import request from 'supertest'
import { app } from "@src/app"

let connection: Connection
let userId: string
let token: string

describe('Show user Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    let passwordHash = await hash('123456', 8)
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

  it ('Should be able to show an user profile by user id', async () => {

    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${token}`
    })

    const { id } = response.body

    expect(id).toEqual(userId)
    expect(response.status).toBe(200)
  })

  it ('Should not be able to show the profile with no authentication', async () => {
    const response = await request(app).get('/api/v1/profile').set({
      Authorization: token
    })

    expect(response.status).toBe(401)
  })
})