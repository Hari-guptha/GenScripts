# Document Extractor Service

Python service for extracting content from PDF, DOCX, and DOC files using multiple strategies.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
- `RABBITMQ_URL`: RabbitMQ connection URL
- `RABBITMQ_QUEUE_DOCUMENT_EXTRACTOR`: Queue name for incoming tasks
- `RABBITMQ_QUEUE_RESULT`: Queue name for results

3. Run the service:
```bash
python main.py
```

## Extraction Strategies

- **Layout-based**: Preserves document structure and layout
- **Simple**: Basic text extraction

## Supported Formats

- PDF (using PyMuPDF)
- DOCX (using python-docx)
- DOC (requires additional setup)

## Message Format

Input message:
```json
{
  "file_path": "/path/to/file.pdf",
  "file_type": "pdf",
  "strategy": "layout",
  "agent_id": "agent_123"
}
```

Output message:
```json
{
  "agent_id": "agent_123",
  "source_type": "file_upload",
  "file_path": "/path/to/file.pdf",
  "file_type": "pdf",
  "extraction_result": {
    "text": "Full extracted text...",
    "metadata": {...},
    "pages": [...],
    "tables": [...],
    "chunks": ["chunk1", "chunk2", ...]
  }
}
```
