import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class OpenSearchService implements OnModuleInit {
  private client: Client;
  private readonly papersIndex: string;
  private readonly chunksIndex: string;
  private isConnected: boolean = false;
  private readonly logger = new Logger(OpenSearchService.name);

  constructor(private configService: ConfigService) {
    const node = this.configService.get<string>('opensearch.node') || 'http://localhost:9200';
    this.papersIndex = this.configService.get<string>('opensearch.indices.papers') || 'papers';
    this.chunksIndex = this.configService.get<string>('opensearch.indices.chunks') || 'chunks';

    this.client = new Client({
      node,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async onModuleInit() {
    try {
      await this.createIndices();
      this.isConnected = true;
      this.logger.log('OpenSearch connected and indices initialized');
    } catch (error) {
      this.logger.warn(
        `OpenSearch connection failed: ${error.message}. The application will continue without OpenSearch functionality.`,
      );
      this.isConnected = false;
    }
  }

  private async createIndices() {
    // Test connection first
    try {
      await this.client.ping();
    } catch (error) {
      throw new Error(`Cannot connect to OpenSearch at ${this.configService.get<string>('opensearch.node')}`);
    }

    // Create papers index
    const papersIndexExists = await this.client.indices.exists({
      index: this.papersIndex,
    });

    if (!papersIndexExists) {
      await this.client.indices.create({
        index: this.papersIndex,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
          },
          mappings: {
            properties: {
              paperId: { type: 'keyword' },
              agentId: { type: 'keyword' },
              title: { type: 'text' },
              content: { type: 'text' },
              sourceType: { type: 'keyword' },
              sourceUrl: { type: 'keyword' },
              embedding: {
                type: 'knn_vector',
                dimension: this.configService.get<number>('embedding.dimension') || 1536,
                method: {
                  name: 'hnsw',
                  space_type: 'cosinesimil',
                  engine: 'nmslib',
                },
              },
              metadata: { type: 'object' },
              createdAt: { type: 'date' },
            },
          },
        },
      });
    }

    // Create chunks index
    const chunksIndexExists = await this.client.indices.exists({
      index: this.chunksIndex,
    });

    if (!chunksIndexExists) {
      await this.client.indices.create({
        index: this.chunksIndex,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
          },
          mappings: {
            properties: {
              chunkId: { type: 'keyword' },
              paperId: { type: 'keyword' },
              agentId: { type: 'keyword' },
              content: { type: 'text' },
              embedding: {
                type: 'knn_vector',
                dimension: this.configService.get<number>('embedding.dimension') || 1536,
                method: {
                  name: 'hnsw',
                  space_type: 'cosinesimil',
                  engine: 'nmslib',
                },
              },
              metadata: { type: 'object' },
              createdAt: { type: 'date' },
            },
          },
        },
      });
    }
  }

  async indexPaper(paperData: {
    paperId: string;
    agentId: string;
    title: string;
    content: string;
    sourceType: string;
    sourceUrl?: string;
    embedding: number[];
    metadata?: any;
  }) {
    if (!this.isConnected) {
      this.logger.warn('OpenSearch is not connected. Skipping paper indexing.');
      return null;
    }
    try {
      return await this.client.index({
        index: this.papersIndex,
        body: {
          ...paperData,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to index paper: ${error.message}`);
      throw error;
    }
  }

  async indexChunk(chunkData: {
    chunkId: string;
    paperId: string;
    agentId: string;
    content: string;
    embedding: number[];
    metadata?: any;
  }) {
    if (!this.isConnected) {
      this.logger.warn('OpenSearch is not connected. Skipping chunk indexing.');
      return null;
    }
    try {
      return await this.client.index({
        index: this.chunksIndex,
        body: {
          ...chunkData,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to index chunk: ${error.message}`);
      throw error;
    }
  }

  async semanticSearch(
    queryEmbedding: number[],
    agentId: string,
    limit: number = 10,
    index: 'papers' | 'chunks' = 'chunks',
  ) {
    if (!this.isConnected) {
      this.logger.warn('OpenSearch is not connected. Returning empty search results.');
      return [];
    }
    try {
      const targetIndex = index === 'papers' ? this.papersIndex : this.chunksIndex;

      const response = await this.client.search({
        index: targetIndex,
        size: limit,
        body: {
          query: {
            bool: {
              must: [
                {
                  match: {
                    agentId,
                  },
                },
              ],
            },
          },
        },
        knn: {
          field: 'embedding',
          query_vector: queryEmbedding,
          k: limit,
        },
      } as any);

      return response.body.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        source: hit._source,
      }));
    } catch (error) {
      this.logger.error(`Failed to perform semantic search: ${error.message}`);
      return [];
    }
  }

  async deleteByAgentId(agentId: string) {
    if (!this.isConnected) {
      this.logger.warn('OpenSearch is not connected. Skipping delete operation.');
      return;
    }
    try {
      await this.client.deleteByQuery({
        index: this.papersIndex,
        body: {
          query: {
            match: {
              agentId,
            },
          },
        },
      });

      await this.client.deleteByQuery({
        index: this.chunksIndex,
        body: {
          query: {
            match: {
              agentId,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to delete by agentId: ${error.message}`);
      throw error;
    }
  }

  getClient(): Client {
    return this.client;
  }
}
