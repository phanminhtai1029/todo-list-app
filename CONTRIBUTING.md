# Contributing to Todo-List Application

Thank you for considering contributing to our project! This document provides guidelines and instructions for contributing.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Messages](#commit-messages)
6. [Pull Request Process](#pull-request-process)
7. [Testing Guidelines](#testing-guidelines)

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior
- Be respectful and considerate
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other contributors

### Unacceptable Behavior
- Harassment or discriminatory language
- Personal attacks or trolling
- Publishing others' private information
- Any conduct that could reasonably be considered inappropriate

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- MongoDB 8.0+
- Redis 7+
- Git

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/todo-list-app.git
   cd todo-list-app
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/todo-list-app.git
   ```

3. **Set up backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   ```

4. **Set up frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   ```

5. **Start services**
   ```bash
   # Option 1: Docker
   docker-compose up -d

   # Option 2: Manual
   # Start MongoDB and Redis, then:
   cd backend && uvicorn app.main:app --reload
   cd frontend && npm run dev
   ```

## Development Workflow

### 1. Create an Issue
Before starting work, create an issue describing:
- What you want to build/fix
- Why it's needed
- How you plan to implement it

Wait for approval from maintainers.

### 2. Create a Branch
```bash
# Update your fork
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b bugfix/issue-number-description
```

### Branch Naming Convention
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Production hotfixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 3. Make Changes
- Write clean, readable code
- Follow coding standards (see below)
- Add tests for new features
- Update documentation if needed

### 4. Test Your Changes
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Run linters
make lint
```

### 5. Commit Your Changes
Follow our commit message convention (see below).

```bash
git add .
git commit -m "feat(auth): add password reset functionality"
```

### 6. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### Backend (Python/FastAPI)

#### Style Guide
- Follow PEP 8
- Use type hints
- Maximum line length: 88 characters (Black default)
- Use descriptive variable names

#### Example
```python
from typing import Optional
from fastapi import HTTPException

async def get_user_by_email(email: str) -> Optional[User]:
    """
    Retrieve user by email address.
    
    Args:
        email: User's email address
        
    Returns:
        User object if found, None otherwise
    """
    user = await User.find_one(User.email == email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

#### Formatting
```bash
# Format with Black
black app/

# Lint with flake8
flake8 app/

# Type check with mypy
mypy app/
```

### Frontend (TypeScript/React)

#### Style Guide
- Use TypeScript for all new code
- Use functional components with hooks
- Use meaningful component and variable names
- Keep components small and focused

#### Example
```typescript
interface CardProps {
  id: string;
  title: string;
  onDelete: (id: string) => void;
}

export const Card: React.FC<CardProps> = ({ id, title, onDelete }) => {
  const handleDelete = () => {
    if (confirm('Delete this card?')) {
      onDelete(id);
    }
  };

  return (
    <div className="card">
      <h3>{title}</h3>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};
```

#### Formatting
```bash
# Lint with ESLint
npm run lint

# Format with Prettier
npm run format
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
# Feature
feat(auth): add JWT refresh token mechanism

Implemented automatic token refresh to improve user experience.
Users no longer need to log in every 30 minutes.

Closes #123

# Bug fix
fix(cards): prevent duplicate card creation

Fixed race condition that allowed creating duplicate cards
when user clicked submit button multiple times.

Fixes #456

# Documentation
docs(readme): update installation instructions

Added Docker setup instructions and troubleshooting section.

# Breaking change
feat(api)!: change board API response format

BREAKING CHANGE: Board API now returns nested lists instead
of separate lists endpoint. Update frontend accordingly.
```

## Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with develop

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe tests you ran

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #123
Related to #456
```

### Review Process
1. Maintainers will review your PR
2. Address feedback and make changes if needed
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release!

## Testing Guidelines

### Backend Tests
- Write tests for all new features
- Aim for 80%+ code coverage
- Use pytest fixtures for common setup
- Test both success and error cases

```python
# Example test
async def test_create_board(client, auth_headers):
    """Test board creation"""
    response = await client.post(
        "/api/boards",
        json={"title": "Test Board"},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test Board"
```

### Frontend Tests
- Test component rendering
- Test user interactions
- Test API integration
- Use React Testing Library

```typescript
// Example test
test('renders card component', () => {
  render(<Card id="1" title="Test Card" onDelete={jest.fn()} />);
  expect(screen.getByText('Test Card')).toBeInTheDocument();
});
```

## Questions?

- Check existing issues and discussions
- Join our Discord/Slack (if available)
- Email: dev@yourapp.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
