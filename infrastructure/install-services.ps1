# PowerShell script to install and start infrastructure services
# This script checks for Docker and installs it if needed, then starts all services

Write-Host "=== Infrastructure Services Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue

if (-not $dockerInstalled) {
    Write-Host "Docker is not installed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please install Docker Desktop for Windows:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host "2. Run the installer and follow the setup wizard" -ForegroundColor White
    Write-Host "3. Restart your computer if prompted" -ForegroundColor White
    Write-Host "4. Start Docker Desktop from the Start menu" -ForegroundColor White
    Write-Host "5. Wait for Docker Desktop to fully start (whale icon in system tray)" -ForegroundColor White
    Write-Host "6. Run this script again" -ForegroundColor White
    Write-Host ""
    
    # Try to open download page (non-interactive mode)
    try {
        Write-Host "Opening Docker Desktop download page..." -ForegroundColor Cyan
        Start-Process "https://www.docker.com/products/docker-desktop/"
    } catch {
        Write-Host "Please manually visit: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    }
    
    exit 1
}

Write-Host "Docker is installed: $($dockerInstalled.Source)" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
Write-Host "Checking if Docker is running..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker command failed"
    }
    Write-Host "Docker version: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Docker is installed but not running." -ForegroundColor Red
    Write-Host "Please start Docker Desktop and wait for it to fully initialize." -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if docker-compose is available
Write-Host "Checking for docker-compose..." -ForegroundColor Cyan
try {
    $composeVersion = docker compose version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose command failed"
    }
    Write-Host "Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "Docker Compose is not available. Please update Docker Desktop." -ForegroundColor Red
    exit 1
}

# Navigate to infrastructure directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host ""
Write-Host "Starting infrastructure services..." -ForegroundColor Cyan
Write-Host "This will start: MongoDB, Redis, RabbitMQ, and OpenSearch" -ForegroundColor White
Write-Host ""

# Start services
docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Services Started Successfully ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service URLs:" -ForegroundColor Cyan
    Write-Host "  MongoDB:     mongodb://admin:admin123@localhost:27017/genscripts" -ForegroundColor White
    Write-Host "  Redis:       localhost:6379" -ForegroundColor White
    Write-Host "  RabbitMQ:    amqp://admin:admin123@localhost:5672" -ForegroundColor White
    Write-Host "  RabbitMQ UI: http://localhost:15672 (admin/admin123)" -ForegroundColor White
    Write-Host "  OpenSearch:  http://localhost:9200" -ForegroundColor White
    Write-Host "  OpenSearch Dashboards: http://localhost:5601" -ForegroundColor White
    Write-Host ""
    Write-Host "To view service status: docker compose ps" -ForegroundColor Yellow
    Write-Host "To view logs: docker compose logs -f [service-name]" -ForegroundColor Yellow
    Write-Host "To stop services: docker compose down" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Failed to start services. Check the error messages above." -ForegroundColor Red
    exit 1
}
