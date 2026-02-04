import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaperGenerationService } from './paper-generation.service';
import { PaperAgent, PaperAgentSchema } from './schemas/paper-agent.schema';
import { Paper, PaperSchema } from './schemas/paper.schema';
import { LLMOrchestratorModule } from '../llm-orchestrator/llm-orchestrator.module';
import { VectorDbModule } from '../vector-db/vector-db.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaperAgent.name, schema: PaperAgentSchema },
      { name: Paper.name, schema: PaperSchema },
    ]),
    LLMOrchestratorModule,
    VectorDbModule,
  ],
  providers: [PaperGenerationService],
  exports: [PaperGenerationService],
})
export class PaperGenerationModule {}
