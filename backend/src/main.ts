import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './modules/auth/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Initialize default user
  const usersService = app.get(UsersService);
  await usersService.initializeDefaultUser();
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || process.env.API_PORT || 3001;
  
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
}
bootstrap();
