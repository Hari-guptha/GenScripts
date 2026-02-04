import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIProvider {
  private client: OpenAI;

  initialize(apiKey: string, baseUrl?: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    });
  }

  async generateText(prompt: string, model: string = 'gpt-4'): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '';
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.generateText('Test', 'gpt-3.5-turbo');
      return true;
    } catch {
      return false;
    }
  }
}
