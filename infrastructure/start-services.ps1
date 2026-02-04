# Quick script to start all infrastructure services
# Assumes Docker is already installed and running

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Starting infrastructure services..." -ForegroundColor Cyan
docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "Services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "View status: docker compose ps" -ForegroundColor Yellow
} else {
    Write-Host "Failed to start services." -ForegroundColor Red
    exit 1
}
