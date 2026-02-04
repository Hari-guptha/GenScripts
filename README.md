# GenScripts - AI Research Paper Generation Platform

An AI-powered platform for generating high-quality research papers from multiple sources using advanced RAG (Retrieval-Augmented Generation) techniques.

## Architecture

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS, and Framer Motion
- **Backend**: NestJS with TypeScript
- **Services**: Microservices architecture with Python services for web crawling and document processing
- **Infrastructure**: MongoDB, Redis, RabbitMQ, OpenSearch

## Project Structure

```
genscripts/
├── frontend/              # Next.js application
├── backend/              # NestJS API server
├── services/            # Microservices
│   ├── web-crawler/     # Scrapy-based web crawler service
│   ├── document-extractor/  # Document processing service
│   ├── paper-fetcher/   # Research paper download service
│   ├── llm-orchestrator/    # LLM coordination service
│   └── formatter/       # Paper formatting service
├── shared/              # Shared types, utilities
├── infrastructure/      # Docker, docker-compose, configs
└── docs/               # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.12+
- Docker and Docker Compose
- MongoDB, Redis, RabbitMQ, OpenSearch (or use Docker Compose)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Set up infrastructure services (see `infrastructure/` directory)
4. Configure environment variables
5. Start the services

## Development

See individual service READMEs for development instructions.

## License

MIT
