import { IsEnum, IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { LLMProvider } from '../schemas/llm-config.schema';

export class CreateLLMConfigDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(LLMProvider)
  @IsNotEmpty()
  provider: LLMProvider;

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  baseUrl?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
