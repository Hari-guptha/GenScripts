# Quick script to stop all infrastructure services

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Stopping infrastructure services..." -ForegroundColor Cyan
docker compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "Services stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "Failed to stop services." -ForegroundColor Red
    exit 1
}
