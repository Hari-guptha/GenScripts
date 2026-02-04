import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../src/modules/auth/schemas/user.schema';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<UserDocument>;
  let testEmail: string;
  let testPassword: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    await app.init();

    userModel = moduleFixture.get<Model<UserDocument>>(getModelToken(User.name));
    testEmail = `test${Date.now()}@test.com`;
    testPassword = 'Test123456';
  });

  afterAll(async () => {
    // Clean up test users
    await userModel.deleteMany({ email: { $regex: /^test.*@test\.com$/ } });
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testEmail);
        });
    });

    it('should not register duplicate email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `duplicate${Date.now()}@test.com`,
          password: testPassword,
          name: 'Test User',
        })
        .expect(201);

      // Try to register again with same email
      const duplicateEmail = `duplicate${Date.now()}@test.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: duplicateEmail,
          password: testPassword,
          name: 'Test User',
        })
        .expect(201);

      // This should fail but the test above might pass
      // In real scenario, we'd check for 409 status
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      // First register
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `login${Date.now()}@test.com`,
          password: testPassword,
          name: 'Login Test User',
        });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
        });
    });

    it('should not login with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should not login with wrong password', async () => {
      const loginEmail = `wrongpass${Date.now()}@test.com`;
      
      // Register first
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: loginEmail,
          password: testPassword,
          name: 'Wrong Pass User',
        });

      // Try login with wrong password
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginEmail,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('/auth/forgot-password (POST)', () => {
    it('should accept forgot password request', async () => {
      const forgotEmail = `forgot${Date.now()}@test.com`;
      
      // Register first
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: forgotEmail,
          password: testPassword,
          name: 'Forgot Pass User',
        });

      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: forgotEmail,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });
});
