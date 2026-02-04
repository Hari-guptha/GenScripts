# Infrastructure Services Setup Instructions

## ✅ What's Been Done

1. **Docker Desktop has been installed** via winget
2. **Docker Compose configuration is ready** (docker-compose.yml)
3. **Helper scripts have been created** for managing services

## ⚠️ Current Status

Docker Desktop is installed but may need manual intervention to complete setup.

## 🔧 Next Steps (Manual Actions Required)

### Step 1: Start Docker Desktop

1. **Open Docker Desktop** from the Start menu
   - Search for "Docker Desktop" and launch it
   - OR look for the Docker Desktop icon in your system tray

2. **Complete First-Time Setup** (if prompted):
   - Accept the terms of service
   - Choose your preferred backend (WSL2 recommended)
   - Wait for Docker Desktop to fully initialize (whale icon in system tray should be steady)

3. **If WSL2 is required**:
   - Docker Desktop will prompt you to install WSL2 if needed
   - Follow the installation prompts
   - You may need to restart your computer

### Step 2: Verify Docker is Running

Open PowerShell and run:
```powershell
docker --version
docker ps
```

If both commands work without errors, Docker is ready!

### Step 3: Start Infrastructure Services

Once Docker Desktop is running, execute:

```powershell
cd P:\genscripts\infrastructure
.\wait-and-start.ps1
```

Or manually:
```powershell
cd P:\genscripts\infrastructure
docker compose up -d
```

### Step 4: Verify Services

Check that all services are running:
```powershell
cd P:\genscripts\infrastructure
.\check-services.ps1
```

Or manually:
```powershell
docker compose ps
```

## 📋 Service Details

Once started, these services will be available:

- **MongoDB**: `mongodb://admin:admin123@localhost:27017/genscripts?authSource=admin`
- **Redis**: `localhost:6379` (no password)
- **RabbitMQ**: `amqp://admin:admin123@localhost:5672`
- **RabbitMQ Management UI**: http://localhost:15672 (admin/admin123)
- **OpenSearch**: `http://localhost:9200`
- **OpenSearch Dashboards**: http://localhost:5601

## 🛠️ Available Scripts

- **`install-services.ps1`**: Full setup (checks Docker, installs if needed, starts services)
- **`wait-and-start.ps1`**: Waits for Docker to be ready, then starts services
- **`start-services.ps1`**: Quick start (assumes Docker is running)
- **`stop-services.ps1`**: Stop all services
- **`check-services.ps1`**: Check service status and connectivity

## 🐛 Troubleshooting

### Docker Desktop won't start
- Check if virtualization is enabled in BIOS
- Ensure Windows features for containers are enabled
- Try running Docker Desktop as administrator

### Services won't start
- Ensure Docker Desktop is fully running (whale icon steady in system tray)
- Check if ports are in use: `netstat -ano | findstr "27017 6379 5672 9200"`
- Check Docker Desktop logs: Settings > Troubleshoot > View logs

### Connection refused errors
- Wait a few more minutes for Docker Desktop to fully initialize
- Restart Docker Desktop
- Check service logs: `docker compose logs [service-name]`

## 📝 Notes

- All data is persisted in Docker volumes
- Services will auto-restart on system reboot (if Docker Desktop starts automatically)
- To remove all data: `docker compose down -v`
