# Formatter Service

Python service for formatting research papers in LaTeX, Markdown, and HTML+CSS, with PDF compilation.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Install LaTeX (for PDF compilation):
```bash
# Ubuntu/Debian
sudo apt-get install texlive-full

# macOS
brew install --cask mactex
```

3. Set environment variables:
- `RABBITMQ_URL`: RabbitMQ connection URL
- `RABBITMQ_QUEUE_FORMATTER`: Queue name for incoming tasks
- `RABBITMQ_QUEUE_RESULT`: Queue name for results

4. Run the service:
```bash
python main.py
```

## Supported Formats

- **LaTeX**: Academic paper format
- **Markdown**: Simple, lightweight format
- **HTML+CSS**: Web-friendly format

## PDF Compilation

Requires LaTeX installation. Supports compilation from LaTeX and Markdown formats.

## Message Format

Input message:
```json
{
  "paper_data": {
    "title": "Paper Title",
    "authors": "Author 1, Author 2",
    "date": "2024-01-01",
    "abstract": "...",
    "keywords": "...",
    "introduction": "...",
    "literature_review": "...",
    "methodology": "...",
    "results": "...",
    "discussion": "...",
    "conclusion": "...",
    "references": "...",
    "appendices": "..."
  },
  "format": "latex",
  "compile_pdf": true,
  "agent_id": "agent_123"
}
```
