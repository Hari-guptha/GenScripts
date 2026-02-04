# Test Scripts

## run-all-tests.ps1 (PowerShell)

Runs all frontend and backend E2E tests.

**Usage:**
```powershell
cd P:\genscripts\scripts
.\run-all-tests.ps1
```

**What it does:**
1. Checks if backend (port 3001) and frontend (port 3000) are running
2. Runs backend E2E tests
3. Runs frontend E2E tests
4. Displays summary of results

## run-all-tests.sh (Bash)

Same functionality for Linux/Mac.

**Usage:**
```bash
chmod +x scripts/run-all-tests.sh
./scripts/run-all-tests.sh
```

## Prerequisites

- Backend running on http://localhost:3001
- Frontend running on http://localhost:3000
- MongoDB, Redis, RabbitMQ running (for backend tests)
