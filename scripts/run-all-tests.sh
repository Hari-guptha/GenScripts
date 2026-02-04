#!/bin/bash

# Run all tests for GenScripts project
# This script runs both backend and frontend tests

set -e

echo "🧪 Starting GenScripts Test Suite"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if services are running
echo -e "${YELLOW}Checking if services are running...${NC}"

# Check backend
if ! curl -s http://localhost:3001 > /dev/null; then
    echo -e "${RED}❌ Backend is not running on port 3001${NC}"
    echo "Please start the backend: cd backend && npm run start:dev"
    exit 1
fi

# Check frontend
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}❌ Frontend is not running on port 3000${NC}"
    echo "Please start the frontend: cd frontend && npm run dev"
    exit 1
fi

echo -e "${GREEN}✅ Services are running${NC}"

# Run backend tests
echo ""
echo -e "${YELLOW}Running backend E2E tests...${NC}"
cd backend
npm run test:e2e
BACKEND_TEST_EXIT=$?
cd ..

# Run frontend tests
echo ""
echo -e "${YELLOW}Running frontend E2E tests...${NC}"
cd frontend
npm run test:e2e
FRONTEND_TEST_EXIT=$?
cd ..

# Summary
echo ""
echo "=================================="
echo "📊 Test Summary"
echo "=================================="

if [ $BACKEND_TEST_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Backend tests passed${NC}"
else
    echo -e "${RED}❌ Backend tests failed${NC}"
fi

if [ $FRONTEND_TEST_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend tests passed${NC}"
else
    echo -e "${RED}❌ Frontend tests failed${NC}"
fi

if [ $BACKEND_TEST_EXIT -eq 0 ] && [ $FRONTEND_TEST_EXIT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
