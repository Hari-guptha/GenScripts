export default () => ({
  port: parseInt(process.env.API_PORT || '3001', 10),
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    database: process.env.MONGODB_DATABASE || 'genscripts',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672',
    queues: {
      webCrawler: process.env.RABBITMQ_QUEUE_WEB_CRAWLER || 'web_crawler_queue',
      documentExtractor: process.env.RABBITMQ_QUEUE_DOCUMENT_EXTRACTOR || 'document_extractor_queue',
      paperFetcher: process.env.RABBITMQ_QUEUE_PAPER_FETCHER || 'paper_fetcher_queue',
      llmGeneration: process.env.RABBITMQ_QUEUE_LLM_GENERATION || 'llm_generation_queue',
      formatter: process.env.RABBITMQ_QUEUE_FORMATTER || 'formatter_queue',
    },
  },
  opensearch: {
    node: process.env.OPENSEARCH_NODE || 'http://localhost:9200',
    indices: {
      papers: process.env.OPENSEARCH_INDEX_PAPERS || 'papers',
      chunks: process.env.OPENSEARCH_INDEX_CHUNKS || 'chunks',
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
  },
  fileStorage: {
    path: process.env.FILE_STORAGE_PATH || './storage',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  embedding: {
    model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    dimension: parseInt(process.env.EMBEDDING_DIMENSION || '1536', 10),
  },
});
