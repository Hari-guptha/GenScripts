import { Module } from '@nestjs/common';
import { LLMOrchestratorService } from './llm-orchestrator.service';
import { LLMConfigModule } from '../llm-config/llm-config.module';
import { PromptsModule } from '../prompts/prompts.module';
import { VectorDbModule } from '../vector-db/vector-db.module';

@Module({
  imports: [LLMConfigModule, PromptsModule, VectorDbModule],
  providers: [LLMOrchestratorService],
  exports: [LLMOrchestratorService],
})
export class LLMOrchestratorModule {}
