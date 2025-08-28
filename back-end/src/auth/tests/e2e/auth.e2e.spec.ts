import { INestApplication, ValidationPipe } from "@nestjs/common";
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Connection } from "mongoose";
import { AppModule } from "../../../app.module";
import { CreateUserDto } from "../../../users/dto/create-user.dto";
import * as request from 'supertest';

describe('Auth Endpoints', () => {
  let app: INestApplication;
  let connection: Connection;
  const createUserDto: CreateUserDto = {
    name: 'Alex',
    email: 'alex@email.com',
    cpf: '12345678909',
    password: '123456',
    phone: '123456789'
  }

  beforeAll(async () => {
    const moduleTest: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost/e-commerce-test'),
        AppModule
      ]
    }).compile()

    app = moduleTest.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    connection = moduleTest.get<Connection>(getConnectionToken())
    await app.init();
  })

  beforeEach(async () => {
    await connection.useDb('e-commerce-test').collection('users').deleteMany({});
  })
  
  afterAll(async () => {
    await connection.useDb('e-commerce-test').dropDatabase();
    await connection.close();
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  })

  describe('POST /auth', () => {
    it('should login a user', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: createUserDto.email,
          password: createUserDto.password
        })
        .expect(201);

      expect(response.text).toBe('Login successful');
      expect(response.get('Set-Cookie')).toBeDefined()
    })

    it('should throw an error if user email not found', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: createUserDto.email,
          password: createUserDto.password
        })
        .expect(400);

      expect(response.body).toEqual({
        statusCode: 400,
        message: 'User not found',
        error: 'Bad Request'
      });
    })

    it('should throw an error if password is incorrect', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);
      
      const response = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: createUserDto.email,
          password: 'wrong-password'
        })
        .expect(400);

      expect(response.body).toEqual({
        statusCode: 400,
        message: 'Password incorrect',
        error: 'Bad Request'
      });
    })

    it('should throw errors on invalid DTO fields', async () => {
      const userEmptyDto = new CreateUserDto();

      const response = await request(app.getHttpServer())
        .post('/auth')
        .send(userEmptyDto)
        .expect(400);
      
      expect(response.body).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: expect.arrayContaining([
          "email must be an email",
          "email should not be empty",
          "password should not be empty",
          "password must be a string"
        ])
      });
    })
  })
})