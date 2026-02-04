import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private openai: OpenAI;
  private readonly model: string;
  private readonly dimension: number;

  constructor(private configService: ConfigService) {
    // For embeddings, we'll use OpenAI by default
    // In production, you might want to support multiple providers
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
    this.model = this.configService.get<string>('embedding.model') || 'text-embedding-3-small';
    this.dimension = this.configService.get<number>('embedding.dimension') || 1536;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await this.openai.embeddings.create({
      model: this.model,
      input: text,
      dimensions: this.dimension,
    });

    return response.data[0].embedding;
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await this.openai.embeddings.create({
      model: this.model,
      input: texts,
      dimensions: this.dimension,
    });

    return response.data.map((item) => item.embedding);
  }
}
