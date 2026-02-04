# Run all tests for GenScripts project (PowerShell version)
# This script runs both backend and frontend tests

$ErrorActionPreference = "Stop"

Write-Host "Starting GenScripts Test Suite" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if services are running
Write-Host "Checking if services are running..." -ForegroundColor Yellow

# Check backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "[OK] Backend is running on port 3001" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Backend is not running on port 3001" -ForegroundColor Red
    Write-Host "Please start the backend: cd backend && npm run start:dev" -ForegroundColor Yellow
    exit 1
}

# Check frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "[OK] Frontend is running on port 3000" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Frontend is not running on port 3000" -ForegroundColor Red
    Write-Host "Please start the frontend: cd frontend && npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Get the script directory and navigate to project root
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

# Run backend tests
Write-Host "Running backend E2E tests..." -ForegroundColor Yellow
Push-Location "$projectRoot\backend"
npm run test:e2e
$backendExitCode = $LASTEXITCODE
Pop-Location

# Run frontend tests
Write-Host ""
Write-Host "Running frontend E2E tests..." -ForegroundColor Yellow
Push-Location "$projectRoot\frontend"
npm run test:e2e
$frontendExitCode = $LASTEXITCODE
Pop-Location

# Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

if ($backendExitCode -eq 0) {
    Write-Host "[PASS] Backend tests passed" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Backend tests failed" -ForegroundColor Red
}

if ($frontendExitCode -eq 0) {
    Write-Host "[PASS] Frontend tests passed" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Frontend tests failed" -ForegroundColor Red
}

if ($backendExitCode -eq 0 -and $frontendExitCode -eq 0) {
    Write-Host ""
    Write-Host "All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "Some tests failed" -ForegroundColor Red
    exit 1
}
