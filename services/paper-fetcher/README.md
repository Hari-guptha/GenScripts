# Paper Fetcher Service

Python service for fetching research papers from free sources like arXiv and Semantic Scholar.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
- `RABBITMQ_URL`: RabbitMQ connection URL
- `RABBITMQ_QUEUE_PAPER_FETCHER`: Queue name for incoming tasks
- `RABBITMQ_QUEUE_RESULT`: Queue name for results

3. Run the service:
```bash
python main.py
```

## Supported Sources

- **arXiv**: Free access to preprints
- **Semantic Scholar**: Academic search engine with open access papers

## Message Format

Input message:
```json
{
  "keywords": "machine learning",
  "max_papers": 10,
  "sources": ["arxiv", "semantic_scholar"],
  "agent_id": "agent_123"
}
```

Output message:
```json
{
  "agent_id": "agent_123",
  "source_type": "research_paper",
  "keywords": "machine learning",
  "papers": [
    {
      "title": "Paper Title",
      "authors": ["Author 1", "Author 2"],
      "abstract": "Abstract text...",
      "pdf_url": "https://...",
      "pdf_content": "...",
      "source": "arxiv"
    }
  ]
}
```
