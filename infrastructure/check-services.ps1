# Script to check if all infrastructure services are running

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "=== Checking Infrastructure Services ===" -ForegroundColor Cyan
Write-Host ""

# Check Docker
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "❌ Docker is not installed" -ForegroundColor Red
    Write-Host "   Run install-services.ps1 to set up Docker" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
} catch {
    Write-Host "❌ Docker is not running" -ForegroundColor Red
    Write-Host "   Please start Docker Desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green

# Check services
Write-Host ""
Write-Host "Checking service status..." -ForegroundColor Cyan
docker compose ps

Write-Host ""
Write-Host "Testing service connections..." -ForegroundColor Cyan

# Test MongoDB
$mongoTest = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($mongoTest) {
    Write-Host "✅ MongoDB (27017) is accessible" -ForegroundColor Green
} else {
    Write-Host "❌ MongoDB (27017) is not accessible" -ForegroundColor Red
}

# Test Redis
$redisTest = Test-NetConnection -ComputerName localhost -Port 6379 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($redisTest) {
    Write-Host "✅ Redis (6379) is accessible" -ForegroundColor Green
} else {
    Write-Host "❌ Redis (6379) is not accessible" -ForegroundColor Red
}

# Test RabbitMQ
$rabbitmqTest = Test-NetConnection -ComputerName localhost -Port 5672 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($rabbitmqTest) {
    Write-Host "✅ RabbitMQ (5672) is accessible" -ForegroundColor Green
} else {
    Write-Host "❌ RabbitMQ (5672) is not accessible" -ForegroundColor Red
}

# Test OpenSearch
$opensearchTest = Test-NetConnection -ComputerName localhost -Port 9200 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($opensearchTest) {
    Write-Host "✅ OpenSearch (9200) is accessible" -ForegroundColor Green
} else {
    Write-Host "❌ OpenSearch (9200) is not accessible" -ForegroundColor Red
}

Write-Host ""
