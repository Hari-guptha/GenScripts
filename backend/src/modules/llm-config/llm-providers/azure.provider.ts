import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AzureProvider {
  private client: OpenAI;

  initialize(apiKey: string, baseUrl: string, model: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
      defaultQuery: { 'api-version': '2024-02-15-preview' },
    });
  }

  async generateText(prompt: string, model: string): Promise<string> {
    if (!this.client) {
      throw new Error('Azure OpenAI client not initialized');
    }

    const response = await this.client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '';
  }

  async testConnection(model: string): Promise<boolean> {
    try {
      await this.generateText('Test', model);
      return true;
    } catch {
      return false;
    }
  }
}
