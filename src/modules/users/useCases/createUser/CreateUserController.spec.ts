import { hash } from 'bcryptjs'
import request from 'supertest'

import { Connection } from 'typeorm'
import { v4 as uuid } from 'uuid'

import { app } from '../../../../app'
import createConnection from '../../../../database'

let connection: Connection

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

  //   const id = uuid();
  //   const passwordHash = await hash('123456', 8);

  //   await connection.query(
  //     `INSERT INTO USERS(id, name, email, password, created_at, updated_at )
  //     values('${id}', 'test', 'test@finapi.com.br', '${passwordHash}', 'now()', 'now()')`
  // );
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('Should be able to create a new user', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: 'Lucas',
      email: 'l.servo@hotmail.com',
      password: '123456'
    })

    expect(response.status).toBe(201)
  })

  it('Should not be able to create an user with an existent email', async () => {
    const response  = await request(app).post('/api/v1/users').send({
      name: 'Lucas',
      email: 'l.servo@hotmail.com',
      password: '123456'
    })

    expect(response.status).toBe(400)
  })
})