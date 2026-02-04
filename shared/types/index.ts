// Shared types between frontend and backend

export enum PaperSection {
  TITLE = 'title',
  ABSTRACT = 'abstract',
  KEYWORDS = 'keywords',
  INTRODUCTION = 'introduction',
  LITERATURE_REVIEW = 'literature_review',
  METHODOLOGY = 'methodology',
  RESULTS = 'results',
  DISCUSSION = 'discussion',
  CONCLUSION = 'conclusion',
  REFERENCES = 'references',
  APPENDICES = 'appendices',
}

export enum LLMProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  AZURE = 'azure',
}

export enum PaperStatus {
  DRAFT = 'draft',
  COLLECTING = 'collecting',
  EXTRACTING = 'extracting',
  GENERATING = 'generating',
  FORMATTING = 'formatting',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum SourceType {
  WEB_CRAWLER = 'web_crawler',
  FILE_UPLOAD = 'file_upload',
  RESEARCH_PAPER = 'research_paper',
}

export interface LLMConfig {
  id: string;
  name: string;
  provider: LLMProvider;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaperAgent {
  id: string;
  userId: string;
  name: string;
  purpose?: string;
  status: PaperStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaperSectionContent {
  section: PaperSection;
  content: string;
  llmProvider?: LLMProvider;
  llmConfigId?: string;
  generatedAt?: Date;
}

export interface Paper {
  id: string;
  agentId: string;
  sections: PaperSectionContent[];
  format: 'latex' | 'markdown' | 'html';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessFlow {
  stage: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  details?: string;
  progress?: number;
}
