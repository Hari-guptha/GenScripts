# Script to wait for Docker Desktop to be ready and then start services

Write-Host "=== Waiting for Docker Desktop to be Ready ===" -ForegroundColor Cyan
Write-Host ""

$maxAttempts = 30
$attempt = 0
$dockerReady = $false

while ($attempt -lt $maxAttempts -and -not $dockerReady) {
    $attempt++
    Write-Host "Attempt $attempt of $maxAttempts - Checking Docker status..." -ForegroundColor Yellow
    
    try {
        $result = docker info 2>&1
        if ($LASTEXITCODE -eq 0 -and $result -notmatch "ERROR") {
            $dockerReady = $true
            Write-Host "✅ Docker Desktop is ready!" -ForegroundColor Green
            break
        }
    } catch {
        # Docker not ready yet
    }
    
    if (-not $dockerReady) {
        Write-Host "   Docker Desktop is still initializing... (waiting 10 seconds)" -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
}

if (-not $dockerReady) {
    Write-Host ""
    Write-Host "❌ Docker Desktop is not ready after $maxAttempts attempts." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "1. Docker Desktop is running (check system tray for whale icon)" -ForegroundColor White
    Write-Host "2. Docker Desktop has finished its first-time setup" -ForegroundColor White
    Write-Host "3. WSL2 is installed (if using WSL2 backend)" -ForegroundColor White
    Write-Host "4. You may need to restart your computer after installation" -ForegroundColor White
    Write-Host ""
    Write-Host "Once Docker Desktop is running, execute:" -ForegroundColor Cyan
    Write-Host "  cd P:\genscripts\infrastructure" -ForegroundColor White
    Write-Host "  docker compose up -d" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "=== Starting Infrastructure Services ===" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Pull images first
Write-Host "Pulling Docker images..." -ForegroundColor Yellow
docker compose pull

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Some images failed to pull, but continuing..." -ForegroundColor Yellow
}

# Start services
Write-Host ""
Write-Host "Starting services..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== ✅ Services Started Successfully ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service Status:" -ForegroundColor Cyan
    docker compose ps
    Write-Host ""
    Write-Host "Service URLs:" -ForegroundColor Cyan
    Write-Host "  MongoDB:     mongodb://admin:admin123@localhost:27017/genscripts" -ForegroundColor White
    Write-Host "  Redis:       localhost:6379" -ForegroundColor White
    Write-Host "  RabbitMQ:    amqp://admin:admin123@localhost:5672" -ForegroundColor White
    Write-Host "  RabbitMQ UI: http://localhost:15672 (admin/admin123)" -ForegroundColor White
    Write-Host "  OpenSearch:  http://localhost:9200" -ForegroundColor White
    Write-Host "  OpenSearch Dashboards: http://localhost:5601" -ForegroundColor White
    Write-Host ""
    Write-Host "To view logs: docker compose logs -f [service-name]" -ForegroundColor Yellow
    Write-Host "To stop: docker compose down" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Failed to start services. Check the error messages above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Docker Desktop may need more time to initialize" -ForegroundColor White
    Write-Host "- Ports may be in use (check with: netstat -ano | findstr '27017 6379 5672 9200')" -ForegroundColor White
    Write-Host "- WSL2 may need to be installed/updated" -ForegroundColor White
    exit 1
}
