import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as amqp from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { PaperAgent, PaperAgentDocument } from './schemas/paper-agent.schema';
import { Paper, PaperDocument } from './schemas/paper.schema';
import { LLMOrchestratorService, SectionGenerationTask } from '../llm-orchestrator/llm-orchestrator.service';
import { OpenSearchService } from '../vector-db/opensearch.service';
import { EmbeddingService } from '../vector-db/embedding.service';
import { PaperSection, PaperStatus } from '../../../../shared/types';

@Injectable()
export class PaperGenerationService {
  private rabbitmqConnection: amqp.ChannelModel;
  private rabbitmqChannel: amqp.Channel;

  constructor(
    @InjectModel(PaperAgent.name) private paperAgentModel: Model<PaperAgentDocument>,
    @InjectModel(Paper.name) private paperModel: Model<PaperDocument>,
    private llmOrchestrator: LLMOrchestratorService,
    private openSearchService: OpenSearchService,
    private embeddingService: EmbeddingService,
    private configService: ConfigService,
  ) {}

  async initializeRabbitMQ() {
    const rabbitmqUrl = this.configService.get<string>('rabbitmq.url');
    if (!rabbitmqUrl) {
      throw new Error('RabbitMQ URL is not configured');
    }
    this.rabbitmqConnection = await amqp.connect(rabbitmqUrl);
    this.rabbitmqChannel = await this.rabbitmqConnection.createChannel();
  }

  async createAgent(userId: string, name: string, purpose?: string): Promise<PaperAgent> {
    const agent = new this.paperAgentModel({
      userId,
      name,
      purpose,
      status: PaperStatus.DRAFT,
    });
    return agent.save();
  }

  async startGeneration(agentId: string, userId: string): Promise<void> {
    const agent = await this.paperAgentModel.findOne({ _id: agentId, userId });
    if (!agent) {
      throw new Error('Agent not found');
    }

    agent.status = PaperStatus.COLLECTING;
    await agent.save();

    // Start data collection
    await this.collectData(agent);

    // Extract and store in vector DB
    agent.status = PaperStatus.EXTRACTING;
    await agent.save();
    await this.extractAndStore(agent);

    // Generate paper sections
    agent.status = PaperStatus.GENERATING;
    await agent.save();
    await this.generateSections(agent, userId);

    // Format paper
    agent.status = PaperStatus.FORMATTING;
    await agent.save();
    await this.formatPaper(agent);

    agent.status = PaperStatus.COMPLETED;
    await agent.save();
  }

  private async collectData(agent: PaperAgentDocument): Promise<void> {
    const queues = this.configService.get<any>('rabbitmq.queues');

    // Web crawler tasks
    if (agent.config.webCrawlerKeywords && agent.config.webCrawlerKeywords.length > 0) {
      for (const keywords of agent.config.webCrawlerKeywords) {
        await this.rabbitmqChannel.sendToQueue(
          queues.webCrawler,
          Buffer.from(
            JSON.stringify({
              keywords,
              max_sites: agent.config.maxSites || 10,
              agent_id: agent._id.toString(),
            }),
          ),
        );
      }
    }

    // Paper fetcher tasks
    if (agent.config.paperKeywords && agent.config.paperKeywords.length > 0) {
      for (const keywords of agent.config.paperKeywords) {
        await this.rabbitmqChannel.sendToQueue(
          queues.paperFetcher,
          Buffer.from(
            JSON.stringify({
              keywords,
              max_papers: agent.config.maxPapers || 10,
              agent_id: agent._id.toString(),
            }),
          ),
        );
      }
    }

    // File extraction tasks
    if (agent.config.files && agent.config.files.length > 0) {
      for (const filePath of agent.config.files) {
        await this.rabbitmqChannel.sendToQueue(
          queues.documentExtractor,
          Buffer.from(
            JSON.stringify({
              file_path: filePath,
              file_type: this.getFileType(filePath),
              strategy: 'layout',
              agent_id: agent._id.toString(),
            }),
          ),
        );
      }
    }
  }

  private async extractAndStore(agent: PaperAgentDocument): Promise<void> {
    // This would process results from queues and store in vector DB
    // Implementation would listen to result queues and process them
  }

  private async generateSections(agent: PaperAgentDocument, userId: string): Promise<void> {
    // Get all LLM configs for the user
    // For now, use a default approach
    const sections: PaperSection[] = [
      PaperSection.TITLE,
      PaperSection.ABSTRACT,
      PaperSection.KEYWORDS,
      PaperSection.INTRODUCTION,
      PaperSection.LITERATURE_REVIEW,
      PaperSection.METHODOLOGY,
      PaperSection.RESULTS,
      PaperSection.DISCUSSION,
      PaperSection.CONCLUSION,
      PaperSection.REFERENCES,
    ];

    const tasks: SectionGenerationTask[] = sections.map((section) => ({
      section,
      llmConfigId: 'default', // Would get from user's LLM configs
      context: {
        agentId: agent._id.toString(),
        purpose: agent.purpose,
        keywords: agent.config.paperKeywords,
      },
    }));

    const results = await this.llmOrchestrator.generateSectionsParallel(tasks, userId);

    // Save to paper
    let paper = await this.paperModel.findOne({ agentId: agent._id.toString() });
    if (!paper) {
      paper = new this.paperModel({
        agentId: agent._id.toString(),
        sections: [],
      });
    }

    paper.sections = results.map((result) => ({
      section: result.section,
      content: result.content,
      llmConfigId: result.llmConfigId,
      generatedAt: result.generatedAt,
    }));

    await paper.save();
  }

  private async formatPaper(agent: PaperAgentDocument): Promise<void> {
    const paper = await this.paperModel.findOne({ agentId: agent._id.toString() });
    if (!paper) {
      throw new Error('Paper not found');
    }

    const paperData = {
      title: paper.sections.find((s) => s.section === PaperSection.TITLE)?.content || '',
      authors: 'Generated by GenScripts',
      date: new Date().toISOString().split('T')[0],
      abstract: paper.sections.find((s) => s.section === PaperSection.ABSTRACT)?.content || '',
      keywords: paper.sections.find((s) => s.section === PaperSection.KEYWORDS)?.content || '',
      introduction: paper.sections.find((s) => s.section === PaperSection.INTRODUCTION)?.content || '',
      literature_review: paper.sections.find((s) => s.section === PaperSection.LITERATURE_REVIEW)?.content || '',
      methodology: paper.sections.find((s) => s.section === PaperSection.METHODOLOGY)?.content || '',
      results: paper.sections.find((s) => s.section === PaperSection.RESULTS)?.content || '',
      discussion: paper.sections.find((s) => s.section === PaperSection.DISCUSSION)?.content || '',
      conclusion: paper.sections.find((s) => s.section === PaperSection.CONCLUSION)?.content || '',
      references: paper.sections.find((s) => s.section === PaperSection.REFERENCES)?.content || '',
      appendices: paper.sections.find((s) => s.section === PaperSection.APPENDICES)?.content || '',
    };

    const queues = this.configService.get<any>('rabbitmq.queues');
    await this.rabbitmqChannel.sendToQueue(
      queues.formatter,
      Buffer.from(
        JSON.stringify({
          paper_data: paperData,
          format: paper.format || 'markdown',
          compile_pdf: true,
          agent_id: agent._id.toString(),
        }),
      ),
    );
  }

  private getFileType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    return ext || 'pdf';
  }
}
