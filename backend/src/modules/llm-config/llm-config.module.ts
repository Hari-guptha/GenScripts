import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LLMConfigService } from './llm-config.service';
import { LLMConfigController } from './llm-config.controller';
import { LLMConfig, LLMConfigSchema } from './schemas/llm-config.schema';
import { OpenAIProvider } from './llm-providers/openai.provider';
import { GeminiProvider } from './llm-providers/gemini.provider';
import { AzureProvider } from './llm-providers/azure.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LLMConfig.name, schema: LLMConfigSchema }]),
  ],
  controllers: [LLMConfigController],
  providers: [LLMConfigService, OpenAIProvider, GeminiProvider, AzureProvider],
  exports: [LLMConfigService],
})
export class LLMConfigModule {}
