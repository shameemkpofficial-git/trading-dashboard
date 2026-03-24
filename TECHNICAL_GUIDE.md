# Trading Dashboard - Technical Implementation Guide

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Development Setup](#development-setup)
4. [API Documentation](#api-documentation)
5. [WebSocket Protocol](#websocket-protocol)
6. [Database Schema](#database-schema)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Guide](#deployment-guide)
9. [Monitoring & Debugging](#monitoring--debugging)
10. [Troubleshooting](#troubleshooting)

## Technology Stack

### Frontend Technologies
```typescript
// Core Framework
React 19.2.4          // UI framework with hooks
TypeScript 5.9        // Static typing
Vite 8.0             // Build tool and dev server

// State Management
Zustand 5.0.12       // Lightweight state management

// UI Components & Styling
Recharts 3.8.0       // Chart library
Framer Motion 12.38  // Animation library
Lucide React 1.0.1   // Icon library
React Grid Layout 2.2 // Draggable dashboard layouts

// HTTP Client
Axios 1.13.6         // HTTP requests

// Testing
Vitest 3.0.7         // Unit testing framework
@testing-library/react 16.2.0 // React testing utilities
Playwright 1.58.2    // E2E testing
```

### Backend Technologies
```javascript
// Core Framework
Node.js 20+          // Runtime environment
Express 5.2.1        // Web framework
WebSocket 8.20.0     // Real-time communication

// Authentication
bcryptjs 3.0.3       // Password hashing
jsonwebtoken 9.0.3   // JWT tokens

// Security & Rate Limiting
cors 2.8.6           // Cross-origin resource sharing
express-rate-limit 8.3.1 // API rate limiting

// Logging & Documentation
pino 10.3.1          // Structured logging
swagger-ui-express 5.0.1 // API documentation

// Development & Testing
Node.js built-in test runner // Backend testing
```

### Infrastructure Technologies
```yaml
# Containerization
Docker: Multi-stage builds
Docker Compose: Local development

# Orchestration
Kubernetes: Production deployment
Nginx Ingress: Load balancing and routing
```

## Project Structure

```
trading-dashboard/
├── README.md                 # Project overview and setup
├── ARCHITECTURE.md           # System architecture documentation
├── WORKFLOW.md               # Application workflow diagrams
├── TECHNICAL_GUIDE.md        # Technical implementation guide
├── docker-compose.yml        # Local development setup
├── .github/                  # GitHub workflows
│   └── workflows/
│       └── ci.yml           # Continuous integration
├── k8s/                      # Kubernetes manifests
│   ├── kustomization.yaml   # Kustomize configuration
│   ├── namespace.yaml       # Namespace definition
│   ├── configmap.yaml       # Configuration values
│   ├── ingress.yaml         # Ingress routing
│   ├── hpa.yaml            # Horizontal pod autoscaler
│   ├── backend/            # Backend deployment
│   └── frontend/           # Frontend deployment
├── frontend/                # React frontend application
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── layout/    # Layout components
│   │   │   ├── market/    # Market data components
│   │   │   └── alerts/    # Alert components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # State management
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript type definitions
│   │   ├── constants/     # Application constants
│   │   ├── App.tsx        # Main application component
│   │   └── main.tsx       # Application entry point
│   ├── package.json       # Dependencies and scripts
│   ├── vite.config.ts     # Vite configuration
│   ├── tsconfig.json      # TypeScript configuration
│   ├── eslint.config.js   # ESLint configuration
│   ├── nginx.conf         # Nginx configuration for production
│   └── Dockerfile         # Docker build configuration
└── backend/                 # Node.js backend service
    ├── src/               # Source code
    │   ├── routes/        # API route handlers
    │   │   ├── auth.js    # Authentication routes
    │   │   ├── tickers.js # Ticker data routes
    │   │   ├── history.js # Historical data routes
    │   │   ├── alerts.js  # Alert management routes
    │   │   └── health.js  # Health check routes
    │   ├── utils/         # Utility modules
    │   │   ├── logger.js  # Logging configuration
    │   │   ├── rateLimiters.js # Rate limiting
    │   │   ├── priceUtils.js # Price simulation
    │   │   └── wsUtils.js  # WebSocket utilities
    │   ├── auth.js        # Authentication logic
    │   ├── cache.js       # TTL cache implementation
    │   ├── alertsStore.js # Alert management
    │   └── constants.js   # Application constants
    ├── server.js          # Main server application
    ├── server.test.js     # Backend test suite
    ├── swagger.json       # API documentation
    ├── package.json       # Dependencies and scripts
    └── Dockerfile         # Docker build configuration
```

## Development Setup

### Prerequisites
```bash
# Required software versions
Node.js >= 20.0.0
npm >= 10.0.0
Docker >= 20.0.0 (optional)
kubectl >= 1.28.0 (for K8s deployment)
```

### Local Development Setup

#### 1. Clone and Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd trading-dashboard

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Environment Configuration
```bash
# Backend environment variables (optional)
cd backend
export NODE_ENV=development
export PORT=3000
export LOG_LEVEL=info

# Frontend environment variables (optional)
cd ../frontend
export VITE_API_URL=http://localhost:3000
export VITE_WS_URL=ws://localhost:3000
```

#### 3. Start Development Servers
```bash
# Start backend server (Terminal 1)
cd backend
npm start
# → Server running on http://localhost:3000

# Start frontend dev server (Terminal 2)
cd frontend
npm run dev
# → Dev server running on http://localhost:5173
```

#### 4. Docker Development Setup
```bash
# Using Docker Compose
docker-compose up --build
# → Frontend: http://localhost:80
# → Backend: http://localhost:3001
```

### Development Scripts

#### Frontend Scripts
```json
{
  "dev": "vite",                    // Development server
  "build": "tsc -b && vite build", // Production build
  "lint": "eslint .",              // Code linting
  "preview": "vite preview",       // Preview production build
  "test": "vitest run",            // Unit tests
  "test:e2e": "playwright test",   // E2E tests
  "test:e2e:ui": "playwright test --ui" // E2E tests with UI
}
```

#### Backend Scripts
```json
{
  "start": "node server.js",       // Start production server
  "test": "node --test server.test.js" // Run test suite
}
```

## API Documentation

### Authentication Endpoints

#### POST /register
```javascript
// Request body
{
  "username": "john.doe",
  "password": "securePassword123"
}

// Success response (201)
{
  "username": "john.doe"
}

// Error response (400)
{
  "error": "Username already exists"
}
```

#### POST /login
```javascript
// Request body
{
  "username": "john.doe",
  "password": "securePassword123"
}

// Success response (200)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "john.doe"
  }
}

// Error response (401)
{
  "error": "Invalid credentials"
}
```

### Data Endpoints (Authenticated)

#### GET /tickers
```javascript
// Headers
Authorization: Bearer <jwt-token>

// Success response (200)
["AAPL", "TSLA", "BTC-USD", "ETH-USD", "GOOGL", "MSFT"]
```

#### GET /history/:ticker
```javascript
// Headers
Authorization: Bearer <jwt-token>

// Query parameters
?limit=50  // Number of data points (1-500, default: 100)

// Success response (200)
[
  {
    "time": "2024-01-01T13:00:00.000Z",
    "price": 150.25
  },
  {
    "time": "2024-01-01T13:00:01.000Z",
    "price": 150.75
  }
]

// Cache headers
X-Cache: HIT        // or MISS
X-Cache-TTL: 45s    // Remaining TTL
```

#### GET /health
```javascript
// Headers
Authorization: Bearer <jwt-token>

// Success response (200)
{
  "status": "ok",
  "uptimeSeconds": 3600,
  "tickers": ["AAPL", "TSLA", "BTC-USD"],
  "cache": {
    "hits": 150,
    "misses": 25,
    "hitRate": 0.8571,
    "cachedTickers": ["AAPL", "TSLA"],
    "ttlMs": 60000
  },
  "alerts": {
    "total": 5
  }
}
```

## Swagger API Documentation

### Overview
The Trading Dashboard includes comprehensive Swagger/OpenAPI 3.0 documentation for all REST endpoints. The documentation is automatically generated and accessible through the running backend service.

### Accessing Swagger UI

#### Development Environment
```bash
# Start the backend server
cd backend
npm start

# Access Swagger UI in browser
http://localhost:3000/api-docs
```

#### Production Environment
```bash
# After deployment
https://your-domain.com/api-docs
```

### Swagger Configuration

#### swagger.json Structure
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Trading Dashboard API",
    "version": "1.0.0",
    "description": "API documentation for the Trading Dashboard REST and WebSocket services."
  },
  "servers": [
    {
      "url": "/",
      "description": "Relative server"
    }
  ],
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }
  },
  "security": [
    {
      "bearerAuth": []
    }
  ],
  "paths": {
    "/tickers": {
      "get": {
        "summary": "Get available tickers",
        "description": "Returns a list of all currently supported ticker symbols.",
        "responses": {
          "200": {
            "description": "Successful operation",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

#### Server Integration
```javascript
// server.js - Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Mount Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

### Available Endpoints in Swagger

#### Authentication Endpoints
- **POST /register** - User registration
- **POST /login** - User authentication

#### Data Endpoints (Protected)
- **GET /tickers** - List available tickers
- **GET /history/{ticker}** - Historical price data
- **GET /health** - Service health check

#### Alert Management Endpoints (Protected)
- **POST /alerts** - Create price alert
- **GET /alerts** - List user alerts
- **DELETE /alerts/{id}** - Delete alert

### Swagger UI Features

#### Interactive API Testing
```bash
# Features available in Swagger UI:
1. Try it out - Test endpoints directly in browser
2. Authorization - Add JWT bearer token for protected endpoints
3. Request/Response Examples - See expected formats
4. Schema Documentation - Detailed data structure information
5. Error Responses - View possible error codes and messages
```

#### Authentication Setup in Swagger UI
```bash
# To test protected endpoints:
1. Click "Authorize" button in Swagger UI
2. Enter: Bearer <your-jwt-token>
3. Click "Authorize"
4. Use "Try it out" for any protected endpoint
```

### API Schema Definitions

#### Alert Object Schema
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique alert identifier"
    },
    "ticker": {
      "type": "string",
      "description": "Ticker symbol"
    },
    "condition": {
      "type": "string",
      "enum": ["above", "below"],
      "description": "Alert condition"
    },
    "threshold": {
      "type": "number",
      "format": "float",
      "description": "Price threshold"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "Alert creation timestamp"
    },
    "triggered": {
      "type": "boolean",
      "description": "Whether alert has been triggered"
    }
  },
  "required": ["ticker", "condition", "threshold"]
}
```

#### Price History Point Schema
```json
{
  "type": "object",
  "properties": {
    "time": {
      "type": "string",
      "format": "date-time",
      "description": "Timestamp of price data point"
    },
    "price": {
      "type": "number",
      "format": "float",
      "description": "Price value"
    }
  },
  "required": ["time", "price"]
}
```

#### Health Response Schema
```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "example": "ok"
    },
    "uptimeSeconds": {
      "type": "integer",
      "description": "Server uptime in seconds"
    },
    "tickers": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Available ticker symbols"
    },
    "cache": {
      "type": "object",
      "properties": {
        "hits": {
          "type": "integer",
          "description": "Cache hits count"
        },
        "misses": {
          "type": "integer",
          "description": "Cache misses count"
        },
        "hitRate": {
          "type": "number",
          "format": "float",
          "description": "Cache hit rate (0-1)"
        },
        "cachedTickers": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Currently cached tickers"
        },
        "ttlMs": {
          "type": "integer",
          "description": "Cache TTL in milliseconds"
        }
      }
    },
    "alerts": {
      "type": "object",
      "properties": {
        "total": {
          "type": "integer",
          "description": "Total number of alerts"
        }
      }
    }
  }
}
```

### Error Response Documentation

#### Standard Error Format
```json
{
  "type": "object",
  "properties": {
    "error": {
      "type": "string",
      "description": "Error message describing what went wrong"
    }
  },
  "examples": {
    "authentication": {
      "error": "Invalid credentials"
    },
    "validation": {
      "error": "Unknown ticker \"INVALID\". Valid: AAPL, TSLA, BTC-USD"
    },
    "notFound": {
      "error": "Alert not found"
    }
  }
}
```

#### HTTP Status Codes
```javascript
// Common status codes documented in Swagger:
200 OK          // Successful request
201 Created     // Resource created successfully
400 Bad Request // Invalid input data
401 Unauthorized // Authentication required/failed
403 Forbidden   // Insufficient permissions
404 Not Found   // Resource not found
500 Internal Server Error // Server error
```

### Using Swagger for Development

#### API Testing Workflow
```bash
# 1. Start backend server
npm start

# 2. Open Swagger UI
http://localhost:3000/api-docs

# 3. Test authentication
# POST /login → Get JWT token

# 4. Authorize in Swagger UI
# Click "Authorize" → Enter "Bearer <token>"

# 5. Test protected endpoints
# Use "Try it out" buttons for each endpoint

# 6. Review responses
# Check status codes, headers, and response bodies
```

#### Integration with Development Tools
```bash
# Swagger can be used with:
- Postman (import OpenAPI spec)
- Insomnia (import OpenAPI spec)
- API clients (generate from spec)
- Testing frameworks (generate test cases)
- Documentation generators
```

### Customizing Swagger Documentation

#### Updating swagger.json
```bash
# To modify API documentation:
1. Edit backend/swagger.json
2. Update paths, schemas, descriptions
3. Restart server to see changes
4. Validate with OpenAPI tools if needed
```

#### Adding New Endpoints
```json
// Example: Adding a new endpoint to swagger.json
"/custom-endpoint": {
  "post": {
    "summary": "Custom endpoint description",
    "description": "Detailed description of what this endpoint does",
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/CustomRequest"
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Successful response",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/CustomResponse"
            }
          }
        }
      }
    }
  }
}
```

### Swagger Best Practices

#### Documentation Guidelines
```bash
# Keep documentation accurate:
1. Update swagger.json when adding endpoints
2. Include all possible response codes
3. Provide clear descriptions
4. Add example values for schemas
5. Document error responses
6. Keep authentication requirements current
```

#### Schema Validation
```bash
# Use schemas for:
- Request body validation
- Response structure definition
- Reusable components
- Type safety documentation
- Code generation (optional)
```

### Alert Management Endpoints

#### POST /alerts
```javascript
// Headers
Authorization: Bearer <jwt-token>

// Request body
{
  "ticker": "AAPL",
  "condition": "above",  // "above" or "below"
  "threshold": 150.00
}

// Success response (201)
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ticker": "AAPL",
  "condition": "above",
  "threshold": 150,
  "createdAt": "2024-01-01T13:00:00.000Z",
  "triggered": false
}

// Error responses (400)
{
  "error": "Unknown ticker \"INVALID\". Valid: AAPL, TSLA, BTC-USD"
}
```

#### GET /alerts
```javascript
// Headers
Authorization: Bearer <jwt-token>

// Success response (200)
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "ticker": "AAPL",
    "condition": "above",
    "threshold": 150,
    "createdAt": "2024-01-01T13:00:00.000Z",
    "triggered": false
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "ticker": "TSLA",
    "condition": "below",
    "threshold": 240,
    "createdAt": "2024-01-01T13:00:00.000Z",
    "triggered": true
  }
]
```

#### DELETE /alerts/:id
```javascript
// Headers
Authorization: Bearer <jwt-token>

// Success response (204)
// No content

// Error response (404)
{
  "error": "Alert not found"
}
```

## WebSocket Protocol

### Connection URL
```
ws://localhost:3000  // Development
wss://your-domain.com/ws  // Production
```

### Message Types

#### Client → Server Messages

##### Subscribe to Tickers
```json
{
  "type": "subscribe",
  "tickers": ["AAPL", "TSLA"]
}
```

##### Unsubscribe from All
```json
{
  "type": "unsubscribe"
}
```

#### Server → Client Messages

##### Price Update
```json
{
  "ticker": "AAPL",
  "price": 150.75,
  "time": "2024-01-01T13:00:02.000Z"
}
```

##### Alert Triggered
```json
{
  "type": "alert",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ticker": "AAPL",
  "condition": "above",
  "threshold": 150,
  "price": 155.25,
  "time": "2024-01-01T13:00:02.000Z"
}
```

##### Subscription Acknowledgment
```json
{
  "type": "subscribed",
  "tickers": ["AAPL", "TSLA"],
  "timestamp": "2024-01-01T13:00:00.000Z"
}
```

##### Unsubscription Acknowledgment
```json
{
  "type": "unsubscribed",
  "timestamp": "2024-01-01T13:00:00.000Z"
}
```

### WebSocket Implementation Example

#### Frontend WebSocket Hook
```typescript
// useTradingStore.ts - WebSocket connection management
connectWebSocket: () => {
  set((state) => {
    if (state.ws) return state;

    const ws = new WebSocket(WS_URL);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === WS_TYPE_ALERT) {
        // Handle alert message
        const toastId = `${msg.id}-${Date.now()}`;
        const alertEvent: AlertEvent = { ...msg, toastId };
        
        set((state) => ({
          triggeredAlerts: [...state.triggeredAlerts, alertEvent],
          alerts: state.alerts.map((a) =>
            a.id === msg.id ? { ...a, triggered: true } : a
          ),
        }));

        // Auto-dismiss after timeout
        setTimeout(() => {
          getState().dismissTriggeredAlert(toastId);
        }, TOAST_DURATION_MS);
      } else if (msg.type === WS_TYPE_SUBSCRIBED || 
                 msg.type === WS_TYPE_UNSUBSCRIBED) {
        // Handle subscription acknowledgment
      } else {
        // Handle price update
        getState().updatePrice(msg as PriceUpdate);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      set({ ws: null });
    };

    return { ws };
  });
}
```

#### Backend WebSocket Handler
```javascript
// server.js - WebSocket server setup
wss.on('connection', (ws) => {
  logger.info({ event: 'ws_connected' }, 'Client connected');

  // Initialize subscription (null = subscribe to all)
  ws.subscribedTickers = null;

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === WS_TYPE_SUBSCRIBE && Array.isArray(msg.tickers)) {
        // Filter valid tickers
        const valid = msg.tickers.filter((t) => tickers.includes(t));
        ws.subscribedTickers = new Set(valid);
        
        // Send acknowledgment
        ws.send(JSON.stringify({
          type: WS_TYPE_SUBSCRIBED,
          tickers: valid,
          timestamp: new Date().toISOString(),
        }));
        
        logger.info({ event: 'ws_subscribed', tickers: valid }, 'Client subscribed');
      }

      if (msg.type === WS_TYPE_UNSUBSCRIBE) {
        ws.subscribedTickers = null;
        ws.send(JSON.stringify({ 
          type: WS_TYPE_UNSUBSCRIBED, 
          timestamp: new Date().toISOString() 
        }));
      }
    } catch {
      // Ignore non-JSON messages
    }
  });

  ws.on('close', () => {
    logger.info({ event: 'ws_disconnected' }, 'Client disconnected');
  });

  ws.on('error', (err) => {
    logger.error({ event: 'ws_error', error: err.message }, 'WebSocket Error');
  });
});
```

## Database Schema

### Current In-Memory Schema

#### Price History Storage
```typescript
interface PriceHistory {
  [ticker: string]: Array<{
    time: string;    // ISO timestamp
    price: number;   // Current price
  }>;
}

// Example
const history: PriceHistory = {
  "AAPL": [
    { time: "2024-01-01T13:00:00.000Z", price: 150.25 },
    { time: "2024-01-01T13:00:01.000Z", price: 150.75 }
  ],
  "TSLA": [
    { time: "2024-01-01T13:00:00.000Z", price: 250.50 }
  ]
};
```

#### Alert Storage Schema
```typescript
interface Alert {
  id: string;           // UUID
  ticker: string;       // e.g., "AAPL"
  condition: "above" | "below";
  threshold: number;    // Price threshold
  createdAt: string;    // ISO timestamp
  triggered: boolean;   // Alert status
}

interface AlertEvent {
  id: string;           // Alert ID
  toastId: string;      // Unique toast notification ID
  ticker: string;
  condition: "above" | "below";
  threshold: number;
  price: number;        // Trigger price
  time: string;         // Trigger timestamp
}
```

#### Cache Storage Schema
```typescript
interface CacheEntry {
  data: any[];          // Cached data
  cachedAt: number;     // Timestamp in milliseconds
}

interface CacheStore {
  [key: string]: CacheEntry;
}

// Example
const cache: CacheStore = {
  "AAPL_history": {
    data: [{ time: "...", price: 150.25 }],
    cachedAt: 1704110400000
  }
};
```

## Testing Strategy

### Backend Testing

#### Test Categories
```javascript
// server.test.js - Comprehensive test suite
1. Data Initialization Tests
   - Ticker list validation
   - History seeding verification
   - Data structure validation

2. Cache Functionality Tests
   - Cache miss on first access
   - Cache hit after storing data
   - Cache invalidation
   - TTL expiration behavior
   - Cache statistics accuracy

3. Alert Management Tests
   - Alert creation with valid data
   - Alert creation rejection (invalid data)
   - Alert listing and sorting
   - Alert deletion functionality
   - Alert triggering logic
   - Duplicate trigger prevention

4. API Endpoint Tests
   - Authentication flow
   - Protected route access
   - Data retrieval endpoints
   - Error handling
   - Rate limiting behavior

5. WebSocket Tests
   - Connection establishment
   - Message broadcasting
   - Subscription filtering
   - Connection cleanup
```

#### Running Backend Tests
```bash
cd backend
npm test

# Output example:
✔ Tickers list contains all expected symbols (1.4ms)
✔ History is initialized for all tickers with 50 seed points (0.1ms)
✔ Cache: first get() is a miss, second get() after set() is a hit (0.1ms)
✔ AlertsStore: create() returns a valid alert object (0.3ms)
✔ GET /tickers returns 200 with JSON list (1.4ms)
✔ POST /alerts creates an alert and GET /alerts lists it (5.2ms)
...
✔ tests 25
ℹ pass 25
ℹ fail 0
ℹ duration_ms 463.6ms
```

### Frontend Testing

#### Unit Testing with Vitest
```typescript
// usePrevious.test.ts - Custom hook testing
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePrevious } from './usePrevious';

describe('usePrevious', () => {
  it('should return undefined on initial render', () => {
    const { result } = renderHook(() => usePrevious(1));
    expect(result.current).toBeUndefined();
  });

  it('should return the previous value after update', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 }
    });
    
    expect(result.current).toBeUndefined();

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });
});
```

#### Component Testing
```typescript
// AlertToast.test.tsx - Component testing
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AlertToast from '../alerts/AlertToast';

// Mock the store hook
vi.mock('../../store/useTradingStore', () => ({
  useTradingStore: vi.fn(),
}));

describe('AlertToast', () => {
  it('should render triggered alerts', () => {
    const mockAlerts = [
      {
        toastId: 'toast-1',
        ticker: 'AAPL',
        condition: 'above',
        threshold: 150,
        price: 155,
        time: new Date().toISOString(),
      },
    ];

    vi.mocked(useTradingStore).mockReturnValue({
      triggeredAlerts: mockAlerts,
      dismissTriggeredAlert: vi.fn(),
    });

    render(<AlertToast />);
    
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('above $150')).toBeInTheDocument();
    expect(screen.getByText('Price: $155.00')).toBeInTheDocument();
  });
});
```

#### E2E Testing with Playwright
```typescript
// e2e/dashboard.spec.ts - End-to-end testing
import { test, expect } from '@playwright/test';

test.describe('Trading Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should display login page and authenticate', async ({ page }) => {
    // Check login form is present
    await expect(page.locator('h1')).toContainText('Trading Dashboard');
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    
    // Fill login form
    await page.fill('input#username', 'testuser');
    await page.fill('input#password', 'testpass');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page.locator('.dashboard-header')).toBeVisible();
  });

  test('should display real-time price updates', async ({ page }) => {
    // Login first
    await page.fill('input#username', 'testuser');
    await page.fill('input#password', 'testpass');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.ticker-list');
    
    // Get initial price
    const initialPrice = await page.locator('.ticker-item:first-child .ticker-price').textContent();
    
    // Wait for price to change (WebSocket update)
    await page.waitForFunction(
      (initialPrice) => {
        const currentPrice = document.querySelector('.ticker-item:first-child .ticker-price')?.textContent;
        return currentPrice !== initialPrice;
      },
      initialPrice,
      { timeout: 5000 }
    );
    
    // Verify price changed
    const newPrice = await page.locator('.ticker-item:first-child .ticker-price').textContent();
    expect(newPrice).not.toBe(initialPrice);
  });

  test('should create and trigger price alerts', async ({ page }) => {
    // Login and navigate to alerts
    await page.fill('input#username', 'testuser');
    await page.fill('input#password', 'testpass');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.alert-manager');
    
    // Create alert
    await page.selectOption('.alert-select', 'AAPL');
    await page.fill('.alert-input', '200');
    await page.click('.alert-add-btn');
    
    // Verify alert appears in list
    await expect(page.locator('.alert-item')).toContainText('AAPL');
    await expect(page.locator('.alert-item')).toContainText('above $200');
  });
});
```

#### Running Frontend Tests
```bash
cd frontend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# E2E tests with UI (for debugging)
npm run test:e2e:ui
```

### Test Coverage Strategy

#### Backend Coverage Areas
- ✅ **Core Business Logic**: Price simulation, alert engine
- ✅ **API Endpoints**: All REST endpoints tested
- ✅ **Data Layer**: Cache and storage operations
- ✅ **Authentication**: JWT token handling
- ✅ **WebSocket**: Connection management and messaging
- ✅ **Error Handling**: Edge cases and failure scenarios

#### Frontend Coverage Areas
- ✅ **Custom Hooks**: State management logic
- ✅ **Components**: UI rendering and interactions
- ✅ **User Workflows**: Critical user journeys
- ✅ **Real-time Features**: WebSocket integration
- ✅ **Error States**: Network failures, invalid data

## Deployment Guide

### Docker Deployment

#### Frontend Dockerfile
```dockerfile
# Multi-stage build for production optimization
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/nginx-health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile
```dockerfile
# Single-stage production build
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["node", "server.js"]
```

### Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend-svc:
    image: trading-dashboard-backend:latest
    build: ./backend
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: trading-dashboard-frontend:latest
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      backend-svc:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/nginx-health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Kubernetes Deployment

#### Namespace Configuration
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: trading-dashboard
  labels:
    name: trading-dashboard
```

#### Backend Deployment
```yaml
# k8s/backend/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: trading-dashboard
  labels:
    app: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: trading-dashboard/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: NODE_ENV
        - name: PORT
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: PORT
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Horizontal Pod Autoscaler
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: trading-dashboard
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 1
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Ingress Configuration
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: trading-dashboard-ingress
  namespace: trading-dashboard
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "3600"
spec:
  ingressClassName: nginx
  rules:
  - host: trading-dashboard.local
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 3000
      - path: /ws
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 3000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### Deployment Commands

#### Local Docker Deployment
```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Kubernetes Deployment
```bash
# Deploy to Kubernetes
kubectl apply -k k8s/

# Check deployment status
kubectl get all -n trading-dashboard

# Wait for rollouts
kubectl rollout status deployment/backend -n trading-dashboard
kubectl rollout status deployment/frontend -n trading-dashboard

# Check HPA status
kubectl get hpa -n trading-dashboard

# View logs
kubectl logs -f deployment/backend -n trading-dashboard
kubectl logs -f deployment/frontend -n trading-dashboard
```

## Monitoring & Debugging

### Application Logging

#### Backend Logging Structure
```javascript
// Structured logging with Pino
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Usage examples
logger.info({ port: 3000 }, 'Backend running on port 3000');
logger.error({ err, req: { method: req.method, url: req.url } }, 'API Error');
logger.info({ event: 'ws_connected' }, 'Client connected');
logger.info({ event: 'alert_triggered', ticker: 'AAPL', price: 155.25 }, 'Alert triggered');
```

#### Frontend Error Handling
```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    // Send to error reporting service in production
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details>
            {this.state.error?.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Health Checks

#### Backend Health Endpoint
```javascript
// Comprehensive health check
router.get('/health', auth.authenticateToken, (_req, res) => {
  const health = {
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    tickers,
    cache: cache.stats(),
    alerts: { total: alertsStore.size },
    memory: process.memoryUsage(),
    websocket: {
      connectedClients: wss.clients.size,
    },
  };
  
  res.json(health);
});
```

#### Frontend Health Endpoint
```nginx
# nginx.conf - Health check endpoint
location /nginx-health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

### Performance Monitoring

#### Frontend Performance Metrics
```typescript
// Performance monitoring hook
const usePerformanceMonitor = () => {
  useEffect(() => {
    // Monitor Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'navigation':
            console.log('Page load time:', entry.loadEventEnd - entry.loadEventStart);
            break;
          case 'paint':
            console.log(`${entry.name}: ${entry.startTime}ms`);
            break;
        }
      }
    });

    observer.observe({ entryTypes: ['navigation', 'paint'] });

    return () => observer.disconnect();
  }, []);
};
```

#### Backend Performance Metrics
```javascript
// Request timing middleware
const timingMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    }, 'Request completed');
  });
  
  next();
};

app.use(timingMiddleware);
```

### Debugging Tools

#### WebSocket Debugging
```javascript
// WebSocket connection debugging
const connectWebSocket = () => {
  const ws = new WebSocket(WS_URL);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
    // Send test subscription
    ws.send(JSON.stringify({
      type: 'subscribe',
      tickers: ['AAPL']
    }));
  };
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('WebSocket message received:', message);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = (event) => {
    console.log('WebSocket closed:', event.code, event.reason);
  };
};
```

#### API Debugging
```bash
# Debug API calls with curl
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/tickers

curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"ticker":"AAPL","condition":"above","threshold":150}' \
     http://localhost:3000/alerts

# Debug WebSocket with wscat
npm install -g wscat
wscat -c ws://localhost:3000
```

## Troubleshooting

### Common Issues and Solutions

#### Frontend Issues

##### 1. WebSocket Connection Fails
```bash
# Symptoms
- Real-time updates not working
- Console shows WebSocket connection errors

# Solutions
1. Check backend is running on correct port
2. Verify WebSocket URL in environment variables
3. Ensure CORS is configured correctly

# Debug steps
- Open browser dev tools → Network tab
- Look for failed WebSocket connections
- Check console for error messages
```

##### 2. Authentication Issues
```bash
# Symptoms
- Login redirects back to login page
- API calls return 401 Unauthorized

# Solutions
1. Check JWT secret is consistent
2. Verify token expiration time
3. Clear browser localStorage
4. Check network requests in dev tools

# Debug steps
- Examine localStorage for valid token
- Check JWT payload at jwt.io
- Verify token isn't expired
```

#### Backend Issues

##### 1. Port Already in Use
```bash
# Symptoms
- Error: listen EADDRINUSE :::3000
- Server fails to start

# Solutions
1. Kill process using port 3000
   lsof -ti:3000 | xargs kill -9
2. Change port in environment variables
3. Check for other instances running

# Prevention
- Use process managers like PM2
- Implement graceful shutdown
```

##### 2. Memory Leaks
```bash
# Symptoms
- Memory usage increases over time
- Application becomes slow

# Solutions
1. Monitor memory usage
   node --inspect server.js
2. Check for unclosed WebSocket connections
3. Implement connection cleanup
4. Add memory limits in Docker

# Debug commands
docker stats <container-id>
kubectl top pods -n trading-dashboard
```

#### Deployment Issues

##### 1. Kubernetes Pod Crashes
```bash
# Symptoms
- Pod status shows CrashLoopBackOff
- Containers keep restarting

# Debug commands
kubectl describe pod <pod-name> -n trading-dashboard
kubectl logs <pod-name> -n trading-dashboard --previous

# Common fixes
1. Check resource limits
2. Verify environment variables
3. Ensure health checks are working
4. Check image pull issues
```

##### 2. Ingress Not Working
```bash
# Symptoms
- Cannot access application via Ingress
- 502 Bad Gateway errors

# Debug commands
kubectl describe ingress trading-dashboard-ingress -n trading-dashboard
kubectl logs -n ingress-nginx <ingress-controller-pod>

# Common fixes
1. Check Ingress controller is running
2. Verify service names and ports
3. Check DNS configuration
4. Ensure TLS certificates are valid
```

### Performance Optimization

#### Frontend Optimization
```typescript
// 1. Implement virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

// 2. Use React.memo for expensive components
const TickerItem = React.memo(({ ticker, price, onSelect }) => {
  // Component implementation
});

// 3. Implement debouncing for search/input
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

#### Backend Optimization
```javascript
// 1. Implement connection pooling for database
// 2. Add response compression
const compression = require('compression');
app.use(compression());

// 3. Implement request caching
const apicache = require('apicache');
const cache = apicache.middleware;
app.use(cache('5 minutes'));

// 4. Optimize WebSocket broadcasting
const broadcastToSubscribed = (wss, ticker, message) => {
  const clients = Array.from(wss.clients)
    .filter(client => client.readyState === WebSocket.OPEN)
    .filter(client => !client.subscribedTickers || client.subscribedTickers.has(ticker));
  
  clients.forEach(client => client.send(message));
};
```

This comprehensive technical guide provides detailed implementation details, testing strategies, deployment procedures, and troubleshooting guidance for the Trading Dashboard application. It serves as a complete reference for developers working with or extending this real-time financial monitoring system.
