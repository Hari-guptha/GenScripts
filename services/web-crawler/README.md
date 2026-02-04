# Web Crawler Service

Python service for crawling websites based on keywords.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
- `RABBITMQ_URL`: RabbitMQ connection URL
- `RABBITMQ_QUEUE_WEB_CRAWLER`: Queue name for incoming tasks
- `RABBITMQ_QUEUE_RESULT`: Queue name for results

3. Run the service:
```bash
python main.py
```

## Message Format

Input message:
```json
{
  "keywords": "machine learning",
  "max_sites": 10,
  "agent_id": "agent_123"
}
```

Output message:
```json
{
  "agent_id": "agent_123",
  "source_type": "web_crawler",
  "results": [
    {
      "url": "https://example.com",
      "title": "Page Title",
      "content": "Page content...",
      "depth": 0
    }
  ]
}
```
