#!/bin/bash

set -e

GREEN='\033[0;32m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

echo "🚀 Bắt đầu setup Frontend..."

# Tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd',
          300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9',
          600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e',
        }
      }
    },
  },
  plugins: [],
}
EOF

cat > postcss.config.js << 'EOF'
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
EOF
print_success "Tailwind config"

# index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
}
EOF
print_success "index.css"

# tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
EOF
print_success "tsconfig.json"

# vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } }
  },
})
EOF
print_success "vite.config.ts"

# Directories
mkdir -p src/{components/{common,board,list,card},pages,hooks,services,store,types,utils,config}
touch src/types/index.ts
print_success "Cấu trúc thư mục"

# .env
cat > .env << 'EOF'
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Todo-List App
VITE_APP_VERSION=1.0.0
EOF
print_success ".env"

# constants.ts
cat > src/config/constants.ts << 'EOF'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  BOARDS: '/api/boards',
  LISTS: '/api/lists',
  CARDS: '/api/cards',
};
export const LIMITS = {
  MAX_BOARDS_PER_USER: 7,
  MAX_CARDS_PER_BOARD: 20,
  MAX_FILE_SIZE: 10485760,
};
EOF
print_success "constants.ts"

# api.ts
cat > src/services/api.ts << 'EOF'
import axios from 'axios';
import { API_BASE_URL } from '@/config/constants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refresh_token: refreshToken });
        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch { 
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
EOF
print_success "api.ts"

# App.tsx
cat > src/App.tsx << 'EOF'
import { useState, useEffect } from 'react'
import { api } from './services/api'

interface BackendStatus {
  status: string;
  database: string;
  redis: string;
}

function App() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const testBackend = async () => {
      try {
        const response = await api.get('/health')
        setBackendStatus(response.data)
        setError('')
      } catch (err: any) {
        setError(err.message || 'Cannot connect')
      } finally {
        setLoading(false)
      }
    }
    testBackend()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🎯 Todo-List App</h1>
            <p className="text-gray-600">Full-stack with FastAPI + React</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Backend Status</h2>
            
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            ) : error ? (
              <div className="text-red-600 space-y-2">
                <p className="font-semibold">❌ Connection Failed</p>
                <p className="text-sm">{error}</p>
                <p className="text-xs text-gray-500 mt-2">Make sure Backend is running</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold ${backendStatus?.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                    {backendStatus?.status === 'healthy' ? '✅ Healthy' : '❌ Error'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database:</span>
                  <span className="font-semibold text-green-600">✅ {backendStatus?.database}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Redis:</span>
                  <span className="font-semibold text-green-600">✅ {backendStatus?.redis}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer"
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105">
              📚 API Documentation
            </a>
            <button onClick={() => window.location.reload()}
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition">
              🔄 Refresh Status
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500 space-y-1">
            <p>Frontend: http://localhost:5173</p>
            <p>Backend: http://localhost:8000</p>
            <p className="text-xs mt-2 text-gray-400">Setup completed! 🎉</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
EOF
print_success "App.tsx"

# Remove App.css
rm -f src/App.css
print_success "Xóa App.css"

echo ""
print_success "✨ Setup hoàn tất! Chạy: npm run dev"
