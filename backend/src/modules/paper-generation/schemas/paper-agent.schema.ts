import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PaperStatus } from '@shared/types';

export type PaperAgentDocument = PaperAgent & Document;

@Schema({ timestamps: true })
export class PaperAgent {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  purpose?: string;

  @Prop({ type: String, enum: PaperStatus, default: PaperStatus.DRAFT })
  status: PaperStatus;

  @Prop({ type: Object, default: {} })
  config: {
    maxSites?: number;
    maxPapers?: number;
    webCrawlerKeywords?: string[];
    paperKeywords?: string[];
    links?: string[];
    files?: string[];
  };
}

export const PaperAgentSchema = SchemaFactory.createForClass(PaperAgent);
