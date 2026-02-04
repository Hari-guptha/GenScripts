# Infrastructure Setup

This directory contains Docker Compose configuration and initialization scripts for all infrastructure services.

## Services

- **MongoDB**: Database for application data
- **Redis**: Caching and session management
- **RabbitMQ**: Message queue for async task processing
- **OpenSearch**: Vector database for semantic search

## Quick Start (Windows)

### Option 1: Automated Setup (Recommended)

1. **Install Docker Desktop** (if not already installed):
   - Download from: https://www.docker.com/products/docker-desktop/
   - Run the installer and follow the setup wizard
   - Restart your computer if prompted
   - Start Docker Desktop and wait for it to fully initialize

2. **Run the installation script**:
   ```powershell
   cd infrastructure
   .\install-services.ps1
   ```

   This script will:
   - Check if Docker is installed
   - Guide you through Docker installation if needed
   - Start all infrastructure services automatically

### Option 2: Manual Setup

1. **Install Docker Desktop** (if not already installed):
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop

2. **Start services**:
   ```powershell
   cd infrastructure
   docker compose up -d
   ```

3. **Verify services are running**:
   ```powershell
   .\check-services.ps1
   ```
   Or manually:
   ```powershell
   docker compose ps
   ```

## Available Scripts (Windows)

- **`install-services.ps1`**: Full setup script that checks Docker and starts services
- **`start-services.ps1`**: Quick script to start all services (assumes Docker is running)
- **`stop-services.ps1`**: Stop all services
- **`check-services.ps1`**: Check if all services are running and accessible

## Linux/Mac Setup

1. Copy `.env.example` to `.env` and update with your configuration:
   ```bash
   cp .env.example .env
   ```

2. Start all services:
   ```bash
   docker compose up -d
   ```

3. Verify services are running:
   ```bash
   docker compose ps
   ```

## Access Service UIs

- **RabbitMQ Management**: http://localhost:15672 (admin/admin123)
- **OpenSearch Dashboards**: http://localhost:5601

## Service Connection Details

- **MongoDB**: `mongodb://admin:admin123@localhost:27017/genscripts?authSource=admin`
- **Redis**: `localhost:6379` (no password)
- **RabbitMQ**: `amqp://admin:admin123@localhost:5672`
- **OpenSearch**: `http://localhost:9200`

## Environment Variables

The backend application uses these default values (configured in `backend/src/config/configuration.ts`). You can override them with environment variables:

- `MONGODB_URI` - MongoDB connection string
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)
- `RABBITMQ_URL` - RabbitMQ connection URL
- `OPENSEARCH_NODE` - OpenSearch node URL

See `env.example` for all available configuration options.

## Data Persistence

All data is stored in Docker volumes and will persist across container restarts. To remove all data:

```bash
docker compose down -v
```

## Troubleshooting

### Services won't start
- Ensure Docker Desktop is running
- Check if ports 27017, 6379, 5672, 9200 are already in use
- Run `.\check-services.ps1` to diagnose issues

### Connection refused errors
- Verify services are running: `docker compose ps`
- Check service logs: `docker compose logs [service-name]`
- Ensure Docker Desktop has enough resources allocated (Settings > Resources)
