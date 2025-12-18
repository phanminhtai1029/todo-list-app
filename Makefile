# Makefile for Todo-List Application
# Provides convenient commands for development, testing, and deployment

.PHONY: help setup up down logs restart clean test lint format build deploy-staging deploy-prod

# Default target
help:
	@echo "Available commands:"
	@echo "  make setup           - Initial setup (copy .env files)"
	@echo "  make up              - Start all services"
	@echo "  make down            - Stop all services"
	@echo "  make logs            - View logs"
	@echo "  make restart         - Restart all services"
	@echo "  make clean           - Clean up containers and volumes"
	@echo "  make test            - Run all tests"
	@echo "  make test-backend    - Run backend tests"
	@echo "  make test-frontend   - Run frontend tests"
	@echo "  make lint            - Run linters"
	@echo "  make format          - Format code"
	@echo "  make build           - Build Docker images"
	@echo "  make deploy-staging  - Deploy to staging"
	@echo "  make deploy-prod     - Deploy to production"

# Setup
setup:
	@echo "Setting up environment files..."
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env; fi
	@if [ ! -f frontend/.env ]; then cp frontend/.env.example frontend/.env; fi
	@echo "✅ Environment files created. Please update them with your values."

# Docker Compose commands
up:
	docker-compose up -d
	@echo "✅ Services started. Frontend: http://localhost:5173, Backend: http://localhost:8000"

down:
	docker-compose down

logs:
	docker-compose logs -f

restart:
	docker-compose restart

clean:
	docker-compose down -v
	@echo "⚠️  All containers and volumes removed!"

# Testing
test: test-backend test-frontend

test-backend:
	@echo "Running backend tests..."
	cd backend && source venv/bin/activate && pytest

test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm test -- --run

# Linting
lint: lint-backend lint-frontend

lint-backend:
	@echo "Linting backend..."
	cd backend && source venv/bin/activate && flake8 app/ && black --check app/

lint-frontend:
	@echo "Linting frontend..."
	cd frontend && npm run lint

# Formatting
format: format-backend format-frontend

format-backend:
	@echo "Formatting backend..."
	cd backend && source venv/bin/activate && black app/

format-frontend:
	@echo "Formatting frontend..."
	cd frontend && npm run format

# Build
build:
	docker-compose build

# Deployment
deploy-staging:
	@echo "Deploying to staging..."
	docker-compose -f docker-compose.staging.yml up -d --build
	@echo "✅ Staging deployment complete!"

deploy-prod:
	@echo "Deploying to production..."
	@read -p "Are you sure you want to deploy to production? [y/N] " confirm && [ "$$confirm" = "y" ]
	docker-compose -f docker-compose.prod.yml up -d --build
	@echo "✅ Production deployment complete!"

# Database commands
db-backup:
	@echo "Creating database backup..."
	docker-compose exec mongodb mongodump --out /backups/backup-$$(date +%Y%m%d-%H%M%S)
	@echo "✅ Backup created!"

db-restore:
	@echo "Restoring database..."
	@read -p "Enter backup directory name: " backup_dir && \
	docker-compose exec mongodb mongorestore /backups/$$backup_dir
	@echo "✅ Database restored!"

# Development
dev-backend:
	cd backend && source venv/bin/activate && uvicorn app.main:app --reload

dev-frontend:
	cd frontend && npm run dev

# Install dependencies
install-backend:
	cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

# Health check
health:
	@echo "Checking backend health..."
	@curl -f http://localhost:8000/health || echo "❌ Backend is down!"
	@echo "\nChecking frontend..."
	@curl -f http://localhost:5173 || echo "❌ Frontend is down!"
