import { Injectable } from '@nestjs/common';
import { LLMConfigService } from '../llm-config/llm-config.service';
import { PromptTemplatesService, PromptContext } from '../prompts/prompt-templates.service';
import { OpenSearchService } from '../vector-db/opensearch.service';
import { EmbeddingService } from '../vector-db/embedding.service';
import { PaperSection } from '../../../../shared/types';

export interface SectionGenerationTask {
  section: PaperSection;
  llmConfigId: string;
  context: PromptContext;
}

export interface SectionResult {
  section: PaperSection;
  content: string;
  llmConfigId: string;
  generatedAt: Date;
}

@Injectable()
export class LLMOrchestratorService {
  constructor(
    private llmConfigService: LLMConfigService,
    private promptTemplatesService: PromptTemplatesService,
    private openSearchService: OpenSearchService,
    private embeddingService: EmbeddingService,
  ) {}

  async generateSection(
    section: PaperSection,
    llmConfigId: string,
    userId: string,
    context: PromptContext,
  ): Promise<SectionResult> {
    // Get LLM config
    const llmConfig = await this.llmConfigService.findOne(llmConfigId, userId);

    // Retrieve relevant content from vector DB
    const retrievedContent = await this.retrieveRelevantContent(
      section,
      context.agentId,
      context.purpose || '',
    );

    // Update context with retrieved content
    const enrichedContext: PromptContext = {
      ...context,
      retrievedContent,
    };

    // Generate prompt
    const prompt = this.promptTemplatesService.generatePrompt(section, enrichedContext);

    // Get provider instance and generate
    const provider = await this.llmConfigService.getProviderInstance(llmConfig);
    const model = llmConfig.model || this.getDefaultModel(llmConfig.provider);
    const content = await provider.generateText(prompt, model);

    return {
      section,
      content,
      llmConfigId,
      generatedAt: new Date(),
    };
  }

  async generateSectionsParallel(
    tasks: SectionGenerationTask[],
    userId: string,
  ): Promise<SectionResult[]> {
    // Generate all sections in parallel
    const promises = tasks.map((task) =>
      this.generateSection(task.section, task.llmConfigId, userId, task.context),
    );

    return Promise.all(promises);
  }

  private async retrieveRelevantContent(
    section: PaperSection,
    agentId: string,
    query: string,
    limit: number = 5,
  ): Promise<string[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.embeddingService.generateEmbedding(
        `${section} ${query}`,
      );

      // Search in vector DB
      const results = await this.openSearchService.semanticSearch(
        queryEmbedding,
        agentId,
        limit,
        'chunks',
      );

      return results.map((result) => result.source.content);
    } catch (error) {
      console.error('Error retrieving relevant content:', error);
      return [];
    }
  }

  private getDefaultModel(provider: string): string {
    const defaults: Record<string, string> = {
      openai: 'gpt-4',
      gemini: 'gemini-pro',
      azure: 'gpt-4',
    };
    return defaults[provider] || 'gpt-4';
  }
}
