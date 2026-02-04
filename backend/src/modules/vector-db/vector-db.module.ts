import { Module } from '@nestjs/common';
import { OpenSearchService } from './opensearch.service';
import { EmbeddingService } from './embedding.service';

@Module({
  providers: [OpenSearchService, EmbeddingService],
  exports: [OpenSearchService, EmbeddingService],
})
export class VectorDbModule {}
