# 🚀 Quick Start Guide

Get the Todo-List application running in 5 minutes!

## Prerequisites Check

```bash
# Check Python version (need 3.12+)
python --version

# Check Node.js version (need 18+)
node --version

# Check Docker (optional but recommended)
docker --version
```

## 🎯 Option 1: Docker Compose (Fastest)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd todo-list-app

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start everything with Docker
docker-compose up -d

# 4. Wait 30 seconds for services to start, then access:
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

That's it! 🎉

### Useful Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Clean up everything
docker-compose down -v
```

---

## 🛠 Option 2: Manual Setup (More Control)

### Step 1: Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Update .env with your settings
# (Make sure MongoDB and Redis are running)

# Run backend
uvicorn app.main:app --reload

# Backend will be at: http://localhost:8000
```

### Step 2: Setup Frontend (in new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run frontend
npm run dev

# Frontend will be at: http://localhost:5173
```

### Step 3: Setup Databases

#### MongoDB
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows (if installed)
net start MongoDB
```

#### Redis
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Windows (if installed)
# Run redis-server.exe
```

---

## ✅ Verification

### Check Backend Health
```bash
curl http://localhost:8000/health

# Should return: {"status":"healthy","database":"connected","redis":"connected"}
```

### Check Frontend
Open browser: http://localhost:5173

You should see the Todo-List application!

---

## 📝 Next Steps

1. **Create an account** - Register a new user
2. **Create a board** - Start organizing your tasks
3. **Add lists** - Create "To Do", "In Progress", "Done"
4. **Add cards** - Add your first task
5. **Drag & drop** - Move cards between lists

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process or use different port
```

### Frontend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MongoDB connection error
```bash
# Check if MongoDB is running
mongosh  # Should connect successfully

# If not running, start it:
brew services start mongodb-community  # macOS
sudo systemctl start mongod  # Linux
```

### Redis connection error
```bash
# Check if Redis is running
redis-cli ping  # Should return "PONG"

# If not running, start it:
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

### CORS errors
Make sure `CORS_ORIGINS` in `backend/.env` includes your frontend URL:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 🎓 Learn More

- **Full Documentation**: [README.md](README.md)
- **Setup Guide**: [setup-guide.md](setup-guide.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **API Documentation**: http://localhost:8000/docs (when backend is running)

---

## 🐛 Found a Bug?

1. Check [existing issues](https://github.com/your-repo/issues)
2. Create a new issue with details
3. Include error messages and screenshots

---

**Happy Coding! 🚀**

*Questions? Check the [README](README.md) or create an issue.*
