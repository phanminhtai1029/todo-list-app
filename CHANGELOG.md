# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup
- Docker and Docker Compose configuration
- CI/CD pipeline with GitHub Actions
- Development environment setup
- Project documentation

## [0.1.0] - 2024-12-12

### Added
- **Sprint 0 - Project Setup**
  - FastAPI backend structure
  - React + TypeScript frontend with Vite
  - MongoDB and Redis integration
  - Docker containers for all services
  - Multi-stage Dockerfile for frontend with Nginx
  - Docker Compose files (development, staging, production)
  - GitHub Actions workflows (backend tests, frontend tests, deploy staging, deploy production)
  - Environment configuration files
  - Project documentation (README, CONTRIBUTING, setup guides)
  - Makefile for convenient commands
  - CORS configuration
  - Health check endpoints
  - Code linting and formatting setup (Black, Flake8, ESLint, Prettier)

### Technical Details
- Python 3.12+ backend with FastAPI 0.104+
- Node.js 18+ frontend with React 18+ and TypeScript 5+
- MongoDB 8.0+ database with Beanie ODM
- Redis 7+ for caching and session management
- Tailwind CSS 3+ for styling
- Zustand for state management
- @dnd-kit for drag-and-drop functionality
- JWT authentication with refresh tokens
- GridFS for file storage

### Infrastructure
- Docker containerization
- GitHub Actions CI/CD
- Multi-environment support (dev, staging, prod)
- Automated testing pipeline
- Code quality checks

---

## Sprint Planning

### Sprint 1 - Authentication & User Management (Upcoming)
- [ ] User registration with email validation
- [ ] JWT-based login/logout
- [ ] Token refresh mechanism
- [ ] Token blacklisting with Redis
- [ ] Protected routes
- [ ] User profile management
- [ ] Password hashing with bcrypt
- [ ] Standardized error responses with error codes

### Sprint 2 - Board & List Management
- [ ] Board CRUD operations
- [ ] List CRUD operations
- [ ] Board dashboard
- [ ] List reordering with drag-and-drop
- [ ] Board limits enforcement (5-7 boards per user)

### Sprint 3a - Card Management & Single-List Drag-and-Drop
- [ ] Card CRUD operations
- [ ] Card reordering within lists
- [ ] Card position management with floats
- [ ] Position rebalancing to prevent precision errors

### Sprint 3b - Cross-List Card Movement
- [ ] Drag cards between lists
- [ ] Update source and destination lists
- [ ] Card count validation
- [ ] Optimistic UI updates

### Sprint 4 - Card Details & Metadata
- [ ] Due dates
- [ ] Labels/tags
- [ ] Checklists
- [ ] Card descriptions
- [ ] Priority levels

### Sprint 5 - Search, Filter & File Attachments
- [ ] Full-text search
- [ ] Filter by labels, due dates, assignees
- [ ] File upload with GridFS
- [ ] File preview
- [ ] File download

### Sprint 6 - Sharing & Permissions
- [ ] Share boards with users
- [ ] Role-based permissions (owner, member, viewer)
- [ ] Invite by email
- [ ] Board visibility settings

### Sprint 7 - Real-time Updates & Notifications
- [ ] WebSocket integration
- [ ] "Board has been updated" notifications
- [ ] Online user indicators
- [ ] Activity feed

### Sprint 8 - Testing, Optimization & Deployment
- [ ] End-to-end tests with Playwright
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment
- [ ] Monitoring setup (Sentry)
- [ ] Documentation completion

---

## Version History

### Version Numbering
- **Major version (X.0.0)**: Breaking changes
- **Minor version (0.X.0)**: New features, backward compatible
- **Patch version (0.0.X)**: Bug fixes, backward compatible

### Release Types
- **Alpha**: Early development, unstable
- **Beta**: Feature complete, testing phase
- **RC (Release Candidate)**: Pre-production testing
- **Stable**: Production ready

---

[Unreleased]: https://github.com/your-repo/todo-list-app/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-repo/todo-list-app/releases/tag/v0.1.0
