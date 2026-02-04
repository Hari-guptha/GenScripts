import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../src/modules/auth/schemas/user.schema';
import { LLMConfig, LLMConfigDocument } from '../src/modules/llm-config/schemas/llm-config.schema';

describe('LLMConfigController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<UserDocument>;
  let llmConfigModel: Model<LLMConfigDocument>;
  let authToken: string;
  let userId: string;
  let testEmail: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    await app.init();

    userModel = moduleFixture.get<Model<UserDocument>>(getModelToken(User.name));
    llmConfigModel = moduleFixture.get<Model<LLMConfigDocument>>(getModelToken(LLMConfig.name));

    // Create test user and get token
    testEmail = `llmtest${Date.now()}@test.com`;
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testEmail,
        password: 'Test123456',
        name: 'LLM Test User',
      });

    authToken = registerResponse.body.access_token;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    await llmConfigModel.deleteMany({ userId });
    await userModel.deleteMany({ email: testEmail });
    await app.close();
  });

  describe('/llm-config (POST)', () => {
    it('should create LLM config', () => {
      return request(app.getHttpServer())
        .post('/llm-config')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test OpenAI',
          provider: 'openai',
          apiKey: 'test-api-key-123',
          enabled: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Test OpenAI');
          expect(res.body).toHaveProperty('provider', 'openai');
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/llm-config')
        .send({
          name: 'Test Config',
          provider: 'openai',
          apiKey: 'test-key',
        })
        .expect(401);
    });
  });

  describe('/llm-config (GET)', () => {
    it('should get all LLM configs for user', () => {
      return request(app.getHttpServer())
        .get('/llm-config')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/llm-config')
        .expect(401);
    });
  });

  describe('/llm-config/:id (GET)', () => {
    let configId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/llm-config')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Get Test Config',
          provider: 'gemini',
          apiKey: 'test-gemini-key',
          enabled: true,
        });
      configId = response.body._id || response.body.id;
    });

    it('should get specific LLM config', () => {
      return request(app.getHttpServer())
        .get(`/llm-config/${configId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Get Test Config');
        });
    });
  });

  describe('/llm-config/:id (PATCH)', () => {
    let configId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/llm-config')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Update Test Config',
          provider: 'openai',
          apiKey: 'test-key',
          enabled: true,
        });
      configId = response.body._id || response.body.id;
    });

    it('should update LLM config', () => {
      return request(app.getHttpServer())
        .patch(`/llm-config/${configId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Config Name',
          enabled: false,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Updated Config Name');
          expect(res.body).toHaveProperty('enabled', false);
        });
    });
  });

  describe('/llm-config/:id (DELETE)', () => {
    let configId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/llm-config')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Delete Test Config',
          provider: 'azure',
          apiKey: 'test-azure-key',
          enabled: true,
        });
      configId = response.body._id || response.body.id;
    });

    it('should delete LLM config', () => {
      return request(app.getHttpServer())
        .delete(`/llm-config/${configId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
