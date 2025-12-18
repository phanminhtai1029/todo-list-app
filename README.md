# 📝 Todo-List Web Application

A full-stack web application for task management with drag-and-drop functionality similar to Trello, built with FastAPI (backend), React (frontend), and MongoDB (database).

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.12+-blue)
![Node](https://img.shields.io/badge/node-18+-green)

## 🚀 Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **Board Management**: Create, edit, and organize multiple boards
- **Drag & Drop**: Intuitive card movement within and across lists
- **Real-time Updates**: WebSocket notifications for collaborative work
- **File Attachments**: Upload files with GridFS storage
- **Search & Filter**: Find tasks quickly with full-text search
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Redis Caching**: Optimized performance with intelligent caching

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🛠 Tech Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Database**: MongoDB 8.0+
- **Cache**: Redis 7+
- **ODM**: Beanie 1.23+
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Passlib with bcrypt

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript 5+
- **Build Tool**: Vite 7+
- **Styling**: Tailwind CSS 3+
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Drag & Drop**: @dnd-kit

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (optional)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python** 3.12 or higher
- **Node.js** 18.x or higher
- **MongoDB** 8.0 or higher
- **Redis** 7.x or higher
- **Docker** 20.x or higher (optional but recommended)
- **Git** 2.x or higher

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd todo-list-app

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Start MongoDB and Redis
# See setup-guide.md for installation instructions

# Run the application
uvicorn app.main:app --reload

# Backend will be available at http://localhost:8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Frontend will be available at http://localhost:5173
```

## 💻 Development

### Backend Development

```bash
cd backend
source venv/bin/activate

# Run with hot reload
uvicorn app.main:app --reload

# Run tests
pytest

# Run tests with coverage
pytest --cov=app tests/

# Format code
black app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

### Frontend Development

```bash
cd frontend

# Run development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest                          # Run all tests
pytest tests/test_auth.py       # Run specific test file
pytest -v                       # Verbose output
pytest --cov=app tests/         # With coverage
pytest -k "test_login"          # Run specific test
```

### Frontend Tests

```bash
cd frontend
npm test                        # Run all tests
npm test -- --coverage          # With coverage
npm test -- --watch             # Watch mode
npm test Card.test.tsx          # Run specific test
```

### End-to-End Tests (Coming in Sprint 8)

```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npm run test:e2e
```

## 🚢 Deployment

### Staging Deployment

```bash
# Using docker-compose
docker-compose -f docker-compose.staging.yml up -d

# Or using CI/CD (automatic on push to main/staging branch)
git push origin staging
```

### Production Deployment

```bash
# Using docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Or using CI/CD (automatic on release tag)
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### Environment Variables

#### Backend (.env)

```env
# Database
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=todolist_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# App
DEBUG=true
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## 📁 Project Structure

```
todo-list-app/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── core/              # Config, security
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── repositories/      # Data access layer
│   ├── tests/                 # Backend tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # State management
│   │   └── types/             # TypeScript types
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── .github/
│   └── workflows/             # CI/CD workflows
├── docker-compose.yml         # Local development
├── docker-compose.staging.yml # Staging environment
├── docker-compose.prod.yml    # Production environment
└── README.md                  # This file
```

For detailed structure, see [project-structure.md](project-structure.md).

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗 Architecture

```
┌─────────────────┐
│   React SPA     │ (Frontend - Port 5173/80)
│   + TypeScript  │
└────────┬────────┘
         │
         │ HTTP/REST + WebSocket
         ▼
┌─────────────────┐
│   FastAPI       │ (Backend - Port 8000)
│   + Beanie ODM  │
└────┬───────┬────┘
     │       │
     ▼       ▼
┌─────────┐ ┌──────┐
│ MongoDB │ │ Redis │ (Databases)
│  8.0+   │ │  7+   │
└─────────┘ └──────┘
```

## 🔒 Security

- **Authentication**: JWT tokens with refresh mechanism
- **Password Hashing**: Bcrypt algorithm
- **Token Blacklisting**: Redis-based logout protection
- **Input Validation**: Pydantic models on backend, TypeScript on frontend
- **CORS**: Restricted origins in production
- **Rate Limiting**: API endpoint protection
- **XSS Protection**: Content Security Policy headers
- **HTTPS**: SSL/TLS in production

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

1. Create an issue describing the feature/bug
2. Get approval from maintainers
3. Create a branch from `develop`
4. Make your changes with tests
5. Ensure all tests pass
6. Submit PR to `develop` branch

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Project Lead**: [Your Name]
- **Backend Developer**: [Name]
- **Frontend Developer**: [Name]
- **DevOps Engineer**: [Name]

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@yourapp.com

## 🗺 Roadmap

- [x] Sprint 0: Project Setup & Infrastructure
- [ ] Sprint 1: Authentication & User Management
- [ ] Sprint 2: Board & List Management
- [ ] Sprint 3a: Card Management & Single-List Drag-and-Drop
- [ ] Sprint 3b: Cross-List Card Movement
- [ ] Sprint 4: Card Details & Metadata
- [ ] Sprint 5: Search, Filter & File Attachments
- [ ] Sprint 6: Sharing & Permissions
- [ ] Sprint 7: Real-time Updates & Notifications
- [ ] Sprint 8: Testing, Optimization & Deployment

See [project-progress.md](project-progress.md) for detailed sprint planning.

## 🙏 Acknowledgments

- FastAPI for the amazing web framework
- React team for the powerful UI library
- MongoDB for the flexible database
- All contributors and open-source projects used in this application

---

**Built with ❤️ by the Todo-List Team**

*Last updated: December 2024*
