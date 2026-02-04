import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LLMConfig, LLMConfigDocument, LLMProvider } from './schemas/llm-config.schema';
import { CreateLLMConfigDto } from './dto/create-llm-config.dto';
import { UpdateLLMConfigDto } from './dto/update-llm-config.dto';
import { OpenAIProvider } from './llm-providers/openai.provider';
import { GeminiProvider } from './llm-providers/gemini.provider';
import { AzureProvider } from './llm-providers/azure.provider';

@Injectable()
export class LLMConfigService {
  constructor(
    @InjectModel(LLMConfig.name) private llmConfigModel: Model<LLMConfigDocument>,
    private openAIProvider: OpenAIProvider,
    private geminiProvider: GeminiProvider,
    private azureProvider: AzureProvider,
  ) {}

  async create(userId: string, createDto: CreateLLMConfigDto): Promise<LLMConfig> {
    const config = new this.llmConfigModel({
      ...createDto,
      userId,
    });
    return config.save();
  }

  async findAll(userId: string): Promise<LLMConfig[]> {
    return this.llmConfigModel.find({ userId, enabled: true }).exec();
  }

  async findOne(id: string, userId: string): Promise<LLMConfig> {
    const config = await this.llmConfigModel.findOne({ _id: id, userId }).exec();
    if (!config) {
      throw new NotFoundException('LLM configuration not found');
    }
    return config;
  }

  async update(id: string, userId: string, updateDto: UpdateLLMConfigDto): Promise<LLMConfig> {
    const config = await this.findOne(id, userId);
    Object.assign(config, updateDto);
    return (config as LLMConfigDocument).save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.llmConfigModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('LLM configuration not found');
    }
  }

  async testConnection(id: string, userId: string): Promise<boolean> {
    const config = await this.findOne(id, userId);

    try {
      switch (config.provider) {
        case LLMProvider.OPENAI:
          this.openAIProvider.initialize(config.apiKey, config.baseUrl);
          return await this.openAIProvider.testConnection();
        case LLMProvider.GEMINI:
          this.geminiProvider.initialize(config.apiKey);
          return await this.geminiProvider.testConnection();
        case LLMProvider.AZURE:
          if (!config.baseUrl || !config.model) {
            throw new BadRequestException('Azure requires baseUrl and model');
          }
          this.azureProvider.initialize(config.apiKey, config.baseUrl, config.model);
          return await this.azureProvider.testConnection(config.model);
        default:
          throw new BadRequestException('Unsupported provider');
      }
    } catch (error) {
      throw new BadRequestException(`Connection test failed: ${error.message}`);
    }
  }

  async getProviderInstance(config: LLMConfig) {
    switch (config.provider) {
      case LLMProvider.OPENAI:
        this.openAIProvider.initialize(config.apiKey, config.baseUrl);
        return this.openAIProvider;
      case LLMProvider.GEMINI:
        this.geminiProvider.initialize(config.apiKey);
        return this.geminiProvider;
      case LLMProvider.AZURE:
        if (!config.baseUrl || !config.model) {
          throw new BadRequestException('Azure requires baseUrl and model');
        }
        this.azureProvider.initialize(config.apiKey, config.baseUrl, config.model);
        return this.azureProvider;
      default:
        throw new BadRequestException('Unsupported provider');
    }
  }
}
