import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LLMConfigDocument = LLMConfig & Document;

export enum LLMProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  AZURE = 'azure',
}

@Schema({ timestamps: true })
export class LLMConfig {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: LLMProvider })
  provider: LLMProvider;

  @Prop({ required: true })
  apiKey: string;

  @Prop()
  model?: string;

  @Prop()
  baseUrl?: string;

  @Prop({ default: true })
  enabled: boolean;
}

export const LLMConfigSchema = SchemaFactory.createForClass(LLMConfig);
