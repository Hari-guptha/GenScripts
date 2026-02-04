import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PaperSection } from '@shared/types';

export type PaperDocument = Paper & Document;

@Schema({ timestamps: true })
export class PaperSectionContent {
  @Prop({ required: true, enum: PaperSection })
  section: PaperSection;

  @Prop({ required: true })
  content: string;

  @Prop()
  llmProvider?: string;

  @Prop()
  llmConfigId?: string;

  @Prop()
  generatedAt?: Date;
}

@Schema({ timestamps: true })
export class Paper {
  @Prop({ required: true })
  agentId: string;

  @Prop({ type: [PaperSectionContent], default: [] })
  sections: PaperSectionContent[];

  @Prop({ type: String, enum: ['latex', 'markdown', 'html'], default: 'markdown' })
  format: string;

  @Prop()
  formattedContent?: string;

  @Prop()
  pdfPath?: string;
}

export const PaperSchema = SchemaFactory.createForClass(Paper);
