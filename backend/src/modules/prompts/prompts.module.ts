import { Module } from '@nestjs/common';
import { PromptTemplatesService } from './prompt-templates.service';

@Module({
  providers: [PromptTemplatesService],
  exports: [PromptTemplatesService],
})
export class PromptsModule {}
