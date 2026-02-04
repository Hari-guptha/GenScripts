import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { LLMConfigModule } from './modules/llm-config/llm-config.module';
import { PromptsModule } from './modules/prompts/prompts.module';
import { VectorDbModule } from './modules/vector-db/vector-db.module';
import { LLMOrchestratorModule } from './modules/llm-orchestrator/llm-orchestrator.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get<string>('mongodb.uri');
        // Fallback to connection without authentication if no URI is provided
        return {
          uri: mongoUri || 'mongodb://localhost:27017',
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    LLMConfigModule,
    PromptsModule,
    VectorDbModule,
    LLMOrchestratorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
