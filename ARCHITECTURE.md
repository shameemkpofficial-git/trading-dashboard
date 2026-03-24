# Trading Dashboard - Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Data Flow](#data-flow)
4. [Component Architecture](#component-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Real-time Communication](#real-time-communication)
8. [State Management](#state-management)
9. [Security & Authentication](#security--authentication)
10. [Deployment Architecture](#deployment-architecture)

## Overview

The Trading Dashboard is a real-time financial monitoring application built with a microservices architecture. It provides live price updates, interactive charts, and alert management for financial instruments.

### Key Features
- **Real-time Price Streaming**: WebSocket-based live price updates
- **Interactive Charts**: Historical and real-time price visualization
- **Alert System**: Price threshold notifications
- **User Authentication**: JWT-based secure access
- **Responsive Design**: Multi-device compatible interface
- **Caching Layer**: Performance optimization for historical data

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
│                    (ASCII Art Standard)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                                           │
│  │   Web Browser   │ │
│  │   (React SPA)   │ │
│  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Ingress Layer (K8s)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Nginx Ingress Controller                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │ │
│  │  │   HTTP/80   │  │   HTTPS/443 │  │   WebSocket/ws://   │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│    Frontend Service     │    │    Backend Service      │
│   (React + Nginx)       │    │   (Node.js + Express)   │
├─────────────────────────┤    ├─────────────────────────┤
│  ┌─────────────────────┐│    │  ┌─────────────────────┐│
│  │    React SPA        ││    │  │   Express Server    ││
│  │  - Dashboard UI     ││    │  │  - REST API         ││
│  │  - Chart Components ││    │  │  - WebSocket Server ││
│  │  - Alert Manager    ││    │  │  - Auth Middleware  ││
│  │  - State Management ││    │  │  - Rate Limiting    ││
│  └─────────────────────┘│    │  └─────────────────────┘│
│  ┌─────────────────────┐│    │  ┌─────────────────────┐│
│  │    Nginx Server     ││    │  │   Business Logic    ││
│  │  - Static Files     ││    │  │  - Price Simulation ││
│  │  - Reverse Proxy    ││    │  │  - Alert Engine     ││
│  │  - WebSocket Proxy  ││    │  │  - Cache Manager    ││
│  └─────────────────────┘│    │  └─────────────────────┘│
└─────────────────────────┘    └─────────────────────────┘
                                       │
                              ┌────────┴────────┐
                              ▼                 ▼
                    ┌─────────────────┐
                    │   In-Memory     │
                    │     Storage     │
                    │  ┌─────────────┐ │
                    │  │ Price Data  │ │
                    │  │ User Sessions│ │
                    │  │ Alert Store │ │
                    │  │ Cache Layer │ │
                    │  └─────────────┘ │
                    └─────────────────┘
```

## Data Flow

### 1. Initial Application Load
```
User Access → Nginx Ingress → Frontend Service → React App
                                    ↓
                              Authentication Check
                                    ↓
                         ┌─────────────────────────┐
                         │  If Not Authenticated   │
                         │  Show Login Screen      │
                         └─────────────────────────┘
                                    ↓
                         ┌─────────────────────────┐
                         │  If Authenticated       │
                         │  Load Dashboard Data    │
                         └─────────────────────────┘
```
*(ASCII Art Standard - Box Drawing Characters)*

### 2. Real-time Price Updates Flow
```
Market Data Simulator → Price Engine → WebSocket Server → All Connected Clients
                                    ↓
                              Alert Engine
                                    ↓
                         ┌─────────────────────────┐
                         │  Check Price Thresholds │
                         │  Trigger Alerts if Met  │
                         └─────────────────────────┘
                                    ↓
                              Alert Broadcast
                                    ↓
                         Client Toast Notifications
```

### 3. Historical Data Request Flow
```
Client Request → Nginx → Backend API → Cache Check
                                    ↓
                         ┌─────────────────────────┐
                         │  Cache Hit?             │
                         │  Yes → Return Cached    │
                         │  No → Generate Data     │
                         └─────────────────────────┘
                                    ↓
                              Store in Cache
                                    ↓
                              Return to Client
```

## Component Architecture

### Frontend Component Hierarchy
```
App.tsx
├── AuthPage.tsx (when not authenticated)
└── Dashboard (when authenticated)
    ├── DashboardHeader.tsx
    │   ├── User info display
    │   └── Logout functionality
    └── DashboardLayout.tsx
        ├── ResponsiveGridLayout
        │   ├── TickerList Panel
        │   │   └── TickerItem components
        │   ├── Chart Panel
        │   │   └── Recharts LineChart
        │   ├── AlertManager Panel
        │   │   ├── Alert creation form
        │   │   └── Active alerts list
        │   └── MarketStats Panel
        └── AlertToast (overlay)
            └── Toast notifications
```

### Backend Module Structure
```
server.js (Entry Point)
├── Routes/
│   ├── auth.js (Authentication)
│   ├── tickers.js (Ticker listing)
│   ├── history.js (Historical data)
│   ├── alerts.js (Alert management)
│   └── health.js (Health checks)
├── Utils/
│   ├── logger.js (Logging)
│   ├── rateLimiters.js (Rate limiting)
│   ├── priceUtils.js (Price simulation)
│   └── wsUtils.js (WebSocket utilities)
├── Core/
│   ├── auth.js (JWT authentication)
│   ├── cache.js (TTL cache)
│   ├── alertsStore.js (Alert management)
│   └── constants.js (Configuration)
└── WebSocket Server
    ├── Connection management
    ├── Subscription handling
    └── Message broadcasting
```

## Backend Architecture

### Core Components

#### 1. Express Server Setup
```javascript
// Main server configuration
- CORS enabled
- JSON body parsing
- Rate limiting middleware
- Error handling middleware
- Swagger documentation
```

#### 2. WebSocket Server
```javascript
// WebSocket implementation
- Connection lifecycle management
- Message type routing
- Subscription filtering
- Broadcast optimization
- Graceful shutdown handling
```

#### 3. Authentication System
```javascript
// JWT-based authentication
- User registration/login
- Token generation/validation
- Protected route middleware
- Session management
```

#### 4. Data Management
```javascript
// In-memory data stores
- Price history storage
- Alert management
- User session storage
- TTL cache implementation
```

### API Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/register` | User registration | No |
| POST | `/login` | User login | No |
| GET | `/tickers` | List available tickers | Yes |
| GET | `/history/:ticker` | Historical price data | Yes |
| POST | `/alerts` | Create price alert | Yes |
| GET | `/alerts` | List user alerts | Yes |
| DELETE | `/alerts/:id` | Delete alert | Yes |
| GET | `/health` | Service health check | Yes |

## Frontend Architecture

### Technology Stack
- **React 19**: UI framework with hooks
- **TypeScript**: Type safety
- **Zustand**: State management
- **Recharts**: Chart library
- **Framer Motion**: Animations
- **Vite**: Build tool

### State Management Structure
```typescript
interface TradingState {
  // Market Data
  tickers: string[];
  selectedTicker: string;
  prices: Record<string, number>;
  history: Record<string, ChartPoint[]>;
  
  // WebSocket
  ws: WebSocket | null;
  
  // Alerts
  alerts: Alert[];
  triggeredAlerts: AlertEvent[];
  
  // Authentication
  user: { username: string } | null;
  token: string | null;
  
  // Actions
  setTickers: (tickers: string[]) => void;
  setSelectedTicker: (ticker: string) => void;
  updatePrice: (update: PriceUpdate) => void;
  connectWebSocket: () => void;
  // ... more actions
}
```

### Component Patterns

#### 1. Container/Presentational Pattern
```typescript
// Container Component (logic)
const DashboardLayout = () => {
  const { tickers, prices, selectedTicker } = useTradingStore();
  // Business logic here
  return <DashboardLayoutView {...props} />;
};

// Presentational Component (UI)
const DashboardLayoutView = ({ tickers, prices, ... }) => {
  // Pure UI rendering
};
```

#### 2. Custom Hooks Pattern
```typescript
// Reusable logic encapsulation
const usePriceFlash = (price: number | undefined) => {
  const [flash, setFlash] = useState<FlashState>(null);
  // Price change detection logic
  return flash;
};

const useKeyboardShortcuts = () => {
  // Keyboard navigation logic
};
```

## Real-time Communication

### WebSocket Message Types

#### 1. Client → Server Messages
```typescript
// Subscribe to specific tickers
{
  type: "subscribe",
  tickers: ["AAPL", "TSLA"]
}

// Unsubscribe from all
{
  type: "unsubscribe"
}
```

#### 2. Server → Client Messages
```typescript
// Price update
{
  ticker: "AAPL",
  price: 150.25,
  time: "2024-01-01T13:05:09Z"
}

// Alert triggered
{
  type: "alert",
  id: "uuid",
  ticker: "AAPL",
  condition: "above",
  threshold: 150,
  price: 155.50,
  time: "2024-01-01T13:05:09Z"
}

// Subscription acknowledgment
{
  type: "subscribed",
  tickers: ["AAPL", "TSLA"],
  timestamp: "2024-01-01T13:05:09Z"
}
```

### Connection Management
```typescript
// WebSocket lifecycle
1. Client connects → Server assigns connection ID
2. Client sends subscription preferences
3. Server acknowledges subscription
4. Server broadcasts relevant updates
5. Client can change subscriptions anytime
6. Graceful disconnection handling
```

## State Management

### Frontend State Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Actions  │───▶│  Zustand Store  │───▶│   UI Updates    │
│                 │    │                 │    │                 │
│ - Select ticker │    │ - Market data   │    │ - Re-render     │
│ - Create alert  │    │ - User session  │    │ - Animations    │
│ - Login/Logout  │    │ - WebSocket     │    │ - Toasts        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │ WebSocket Events│              │
         │              │                 │              │
         └──────────────│ - Price updates │──────────────┘
                        │ - Alert triggers│
                        │ - Connection    │
                        └─────────────────┘
```
*(ASCII Art Standard - Flow Diagram)*

### Backend State Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Market Data    │───▶│   Price Engine  │───▶│   Broadcast     │
│   Simulator     │    │                 │    │   Engine        │
│                 │    │ - Update prices │    │                 │
│ - Volatility    │    │ - Check alerts  │    │ - Filter by     │
│ - Intervals     │    │ - Update cache  │    │   subscriptions │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   HTTP API      │              │
         │              │                 │              │
         └──────────────│ - REST endpoints│──────────────┘
                        │ - Auth middleware│
                        │ - Rate limiting  │
                        └─────────────────┘
```
*(ASCII Art Standard - System Flow Diagram)*

## Security & Authentication

### Authentication Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Login    │───▶│   Backend Auth  │───▶│   JWT Token     │
│                 │    │                 │    │   Generation    │
│ - Credentials   │    │ - Validation    │    │                 │
│ - Password hash │    │ - User lookup   │    │ - Sign with     │
│                 │    │ - Token creation│    │   secret key    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Token Storage  │
                       │                 │
                       │ - localStorage  │
                       │ - Auto-refresh  │
                       │ - Expiration    │
                       └─────────────────┘
```

### Security Measures
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure signature with expiration
- **Rate Limiting**: API endpoint protection
- **CORS Configuration**: Cross-origin request control
- **Input Validation**: Sanitization and type checking
- **WebSocket Security**: Connection validation

## Deployment Architecture

### Kubernetes Deployment
```
┌─────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              trading-dashboard Namespace                    │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │  ┌─────────────┐  ┌─────────────────────┐  │ │
│  │  │   ConfigMap │  │   Ingress           │  │ │
│  │  │  (Env vars) │  │  (HTTP + WS)        │  │ │
│  │  └─────────────┘  └─────────────────────┘  │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐│ │
│  │  │              Frontend Deployment                        ││ │
│  │  │  - 2 replicas                                           ││ │
│  │  │  - Nginx + React SPA                                    ││ │
│  │  │  - Health checks                                        ││ │
│  │  │  - Resource limits                                      ││ │
│  │  └─────────────────────────────────────────────────────────┘│ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐│ │
│  │  │              Backend Deployment                         ││ │
│  │  │  - 2 replicas (autoscaling 1-5)                         ││ │
│  │  │  - Node.js + Express                                    ││ │
│  │  │  - WebSocket support                                     ││ │
│  │  │  - Health checks                                        ││ │
│  │  │  - Resource limits                                      ││ │
│  │  └─────────────────────────────────────────────────────────┘│ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐│ │
│  │  │              Horizontal Pod Autoscaler                  ││ │
│  │  │  - CPU threshold: 70%                                   ││ │
│  │  │  - Memory threshold: 80%                                ││ │
│  │  │  - Scale 1-5 replicas                                   ││ │
│  │  └─────────────────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Docker Architecture
```
Frontend Dockerfile:
┌─────────────────────────────────────────┐
│ Stage 1: Build                          │
│ - Node.js 20 Alpine                     │
│ - Install dependencies                  │
│ - Build React app                       │
│                                         │
│ Stage 2: Production                     │
│ - Nginx Alpine                          │
│ - Copy built files                      │
│ - Configure nginx.conf                  │
│ - Expose port 80                        │
└─────────────────────────────────────────┘

Backend Dockerfile:
┌─────────────────────────────────────────┐
│ Single Stage: Production                │
│ - Node.js 20 Alpine                     │
│ - Install dependencies only             │
│ - Copy source code                      │
│ - Expose port 3000                      │
│ - Health check endpoint                 │
└─────────────────────────────────────────┘
```

## Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Lazy loading with React.lazy
- **Memoization**: React.memo for expensive components
- **Debouncing**: Input validation and API calls
- **Bundle Optimization**: Tree shaking and minification

### Backend Optimizations
- **Caching Layer**: TTL cache for historical data
- **Connection Pooling**: Efficient database connections
- **Rate Limiting**: Prevent abuse and ensure stability
- **Compression**: Gzip for API responses
- **WebSocket Optimization**: Selective broadcasting

### Monitoring & Observability
- **Health Checks**: `/health` endpoint with metrics
- **Logging**: Structured logging with Pino
- **Metrics**: Cache hit rates, connection counts
- **Error Tracking**: Comprehensive error handling
- **Performance Monitoring**: Response time tracking

---

This architecture documentation provides a comprehensive overview of the Trading Dashboard's design, implementation, and deployment strategies. The system is built with scalability, maintainability, and performance in mind, following industry best practices for modern web applications.
