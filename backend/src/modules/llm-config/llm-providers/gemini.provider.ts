import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiProvider {
  private client: GoogleGenerativeAI;

  initialize(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateText(prompt: string, model: string = 'gemini-pro'): Promise<string> {
    if (!this.client) {
      throw new Error('Gemini client not initialized');
    }

    const genModel = this.client.getGenerativeModel({ model });
    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.generateText('Test');
      return true;
    } catch {
      return false;
    }
  }
}
