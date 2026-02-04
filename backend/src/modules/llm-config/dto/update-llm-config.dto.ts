import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateLLMConfigDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

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
