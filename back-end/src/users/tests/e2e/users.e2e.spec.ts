import { INestApplication, ValidationPipe } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt";
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Connection, Types } from "mongoose";
import { AppModule } from "../../../app.module";
import { CreateUserDto } from "../../dto/create-user.dto";
import * as request from 'supertest';
import { UpdateUserDto } from "src/users/dto/update-user.dto";

describe('Users Endpoints', () => {
  let app: INestApplication;
  let connection: Connection;
  let jwtService: JwtService;
  let jwtToken: string;
  const createUserDto: CreateUserDto = {
    name: 'Alex',
    email: 'alex@email.com',
    cpf: '12345678909',
    password: '123456',
    phone: '123456789'
  }

  const updateUserDto: UpdateUserDto = {
    name: 'Alex Silva'
  }

  beforeAll(async () => {
    const moduleTest: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost/e-commerce-test'),
        AppModule
      ]
    }).compile();

    app = moduleTest.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    connection = moduleTest.get<Connection>(getConnectionToken())
    await app.init();

    jwtService = moduleTest.get(JwtService);
  })

  beforeEach(async () => {
    await connection.useDb('e-commerce-test').collection('users').deleteMany({});
  })
  
  afterAll(async () => {
    await connection.useDb('e-commerce-test').dropDatabase();
    await connection.close();
    await app.close();
  });

  async function createTestUser(
    app: INestApplication, 
    connection: Connection,
    jwtService: JwtService,
    createUserDto: CreateUserDto, 
    roleTypes: string[]
  ) {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);

    expect(response.body).toMatchObject({
      name: createUserDto.name,
      email: createUserDto.email,
      cpf: createUserDto.cpf,
      phone: createUserDto.phone,
    });

    await connection
      .useDb('e-commerce-test')
      .collection('users')
      .findOneAndUpdate(
        { _id: new Types.ObjectId(response.body._id) },
        { $set: { roles: roleTypes } },
        { returnDocument: 'after' }
      )

    // Cria o token
    jwtToken = await jwtService.signAsync(
      { sub: response.body._id, username: response.body.name }, // payload
      { secret: process.env.JWT_SECRET }, // mesma secret usada no AuthGuard
    );

    return {
      token: jwtToken,
      user: response.body,
    };
  }


  describe('POST /users', () => {
    it('should create a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: createUserDto.name,
        email: createUserDto.email,
        cpf: createUserDto.cpf,
        phone: createUserDto.phone
      });
    })

    it('should throw an error if user already exists', async () => {
      const createUser1 = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(createUser1.body).toMatchObject({
        name: createUserDto.name,
        email: createUserDto.email,
        cpf: createUserDto.cpf,
        phone: createUserDto.phone
      });

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    })

    it('Should throw erros on invalid DTO fields', async () => {
      const userEmptyDto = new CreateUserDto();

      await request(app.getHttpServer())
        .post('/users')
        .send(userEmptyDto)
        .expect(400);
    })
  })

  describe('GET /users', () => {
    it('should return an array of users', async () => {
      const { token } = await createTestUser(app, connection, jwtService, createUserDto, ['admin']);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    })

    it('should throw an error if token is invalid', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer invalid-token`)
        .expect(401)
    })
  })

  describe('GET /users/:id', () => {
    it('should return a user', async () => {
      const createAdmin = await createTestUser(app, connection, jwtService, createUserDto, ['admin']);
      const createUser = await createTestUser(app, connection, jwtService, { ...createUserDto, name: 'Daniel', email: 'daniel@email.com'}, ['user']); 

      const response = await request(app.getHttpServer())
        .get('/users/' + createUser.user._id)
        .set('Authorization', `Bearer ${createAdmin.token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'Daniel',
        email: 'daniel@email.com',
        cpf: createUserDto.cpf,
        phone: createUserDto.phone
      });
    })

    it('should throw an error if user not found', async () => {
      const createAdmin = await createTestUser(app, connection, jwtService, createUserDto, ['admin']);

      await request(app.getHttpServer())
        .get('/users/68823c31515ace1cb0e5c748')
        .set('Authorization', `Bearer ${createAdmin.token}`)
        .expect(400)
    })

    it('should throw an error if token is invalid', async () => {
      await request(app.getHttpServer())
        .get('/users/68823c31515ace1cb0e5c748')
        .set('Authorization', `Bearer invalid-token`)
        .expect(401)
    })
  })

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      const createAdmin = await createTestUser(app, connection, jwtService, createUserDto, ['admin']);
      const createUser = await createTestUser(app, connection, jwtService, { ...createUserDto, name: 'Daniel', email: 'daniel@email.com'}, ['user']);
      
      const response = await request(app.getHttpServer())
        .put('/users/' + createUser.user._id)
        .set('Authorization', `Bearer ${createAdmin.token}`)
        .send(updateUserDto)
        .expect(200);

      expect(response.body).toMatchObject({
        name: updateUserDto.name
      })
    })

    it('should throw an error if user not found', async () => {
      const createAdmin = await createTestUser(app, connection, jwtService, createUserDto, ['admin']);

      await request(app.getHttpServer())
        .put('/users/68823c31515ace1cb0e5c748')
        .set('Authorization', `Bearer ${createAdmin.token}`)
        .send(updateUserDto)
        .expect(400);
    })

    it('should throw an error if token is invalid', async () => {
      await request(app.getHttpServer())
        .put('/users/68823c31515ace1cb0e5c748')
        .set('Authorization', `Bearer invalid-token`)
        .send(updateUserDto)
        .expect(401);
    })
  })

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const createAdmin = await createTestUser(app, connection, jwtService, createUserDto, ['admin']);
      const createUser = await createTestUser(app, connection, jwtService, { ...createUserDto, name: 'Daniel', email: 'daniel@email.com'}, ['user']);

      const response = await request(app.getHttpServer())
        .delete('/users/' + createUser.user._id)
        .set('Authorization', `Bearer ${createAdmin.token}`)
        .expect(200);

      expect(response.text).toBe('User deleted successfully');
    })

    it('should throw an error if user not found', async () => {
      const createAdmin = await createTestUser(app, connection, jwtService, createUserDto, ['admin']);
      
      await request(app.getHttpServer())
        .delete('/users/68823c31515ace1cb0e5c748')
        .set('Authorization', `Bearer ${createAdmin.token}`)
        .expect(400);
    })

    it('should throw an error if token is invalid', async () => {
      await request(app.getHttpServer())
        .delete('/users/68823c31515ace1cb0e5c748')
        .set('Authorization', `Bearer invalid-token`)
        .expect(401);
    })
  })

  describe('GET /users/me', () => {
    it('should return a user', async () => {
      const createUser = await createTestUser(app, connection, jwtService, createUserDto, ['user']);

      const response = await request(app.getHttpServer())
        .get('/users/me')
        // .set('Cookie', login.get('Set-Cookie')![0])
        .set('Authorization', `Bearer ${createUser.token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        name: createUserDto.name,
        email: createUserDto.email,
        cpf: createUserDto.cpf,
        phone: createUserDto.phone
      });
    })

    it('should throw an error if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer invalid-token`)
        .expect(401)

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    })
  })

  describe('PUT /users/me', () => {
    it('should update a user', async () => {
      const createUser = await createTestUser(app, connection, jwtService, createUserDto, ['user']);

      const response = await request(app.getHttpServer())
        .put('/users/me')
        .set('Authorization', `Bearer ${createUser.token}`)
        .send(updateUserDto)
        .expect(200);
      
      expect(response.body).toMatchObject({
        name: updateUserDto.name
      })
    })

    it('Should throw an error if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/me')
        .set('Authorization', `Bearer invalid-token`)
        .expect(401)

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    })
  })
})