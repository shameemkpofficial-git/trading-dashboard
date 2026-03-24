# Trading Dashboard - Application Workflow

## Application Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                USER INTERACTION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                           WEB BROWSER                                        │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │    │
│  │  │   LOGIN PAGE    │  │  DASHBOARD UI   │  │      CHART COMPONENT       │  │    │
│  │  │                 │  │                 │  │                             │  │    │
│  │  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────────────────┐ │  │    │
│  │  │ │ Username    │ │  │ │ Ticker List │ │  │ │    Real-time Chart      │ │  │    │
│  │  │ │ Password    │ │  │ │ AAPL $150.25│ │  │ │    ┌─────┐    ┌─────┐  │ │  │    │
│  │  │ │ [Login]     │ │  │ │ TSLA $250.50│ │  │ │    │     │    │     │  │  │    │
│  │  │ │ [Register]  │ │  │ │ BTC $45,000 │ │  │ │    │ ████│    │ ████│  │  │    │
│  │  │ └─────────────┘ │  │ │ [Click to   │ │  │ │    │     │    │     │  │  │    │
│  │  │                 │  │ │  select]    │ │  │ │    └─────┘    └─────┘  │  │    │
│  │  └─────────────────┘ │  │ └─────────────┘ │  │ └─────────────────────────┘ │  │    │
│  │                     │  │                 │  │                             │  │    │
│  │  ┌─────────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────────────────┐ │  │    │
│  │  │  ALERT MANAGER  │ │  │ │ STATS PANEL │ │  │ │    ALERT TOASTS         │  │    │
│  │  │                 │  │  │ │ Price: $150 │ │  │ │                             │  │    │
│  │  │ ┌─────────────┐ │  │  │ │ Change: +2% │ │  │ │ ⚠️ AAPL above $150!      │  │    │
│  │  │ │ Ticker: AAPL│ │  │  │ │ Volume: 1M  │ │  │ │    Price: $155.25        │  │    │
│  │  │ │ Condition: > │ │  │  │ └─────────────┘ │  │ │    [Dismiss]            │  │    │
│  │  │ │ Threshold:  │ │  │  │                 │  │ └─────────────────────────┘ │  │    │
│  │  │ │ $150        │ │  │  │ ┌─────────────┐ │  │                             │  │    │
│  │  │ │ [Create]    │ │  │  │ │ USER INFO   │ │  │                             │  │    │
│  │  │ └─────────────┘ │  │  │ │ 👤 john.doe │ │  │                             │  │    │
│  │  │                 │  │  │ │ [Logout]    │ │  │                             │  │    │
│  │  │ Active Alerts:  │  │  │ └─────────────┘ │  │                             │  │    │
│  │  │ • AAPL > $150   │  │  └─────────────────┘ │  └─────────────────────────────┘  │    │
│  │  │ • TSLA < $240   │  │                     │                                 │    │
│  │  └─────────────────┘ │  └─────────────────┘  └─────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                 NETWORK LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                          NGINX INGRESS                                        │    │
│  │                                                                             │    │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │    │
│  │  │                    ROUTING TABLE                                     │    │    │
│  │  │                                                                     │    │    │
│  │  │  HTTP/HTTPS  ──►  /api/*     ──►  backend-service:3000              │    │    │
│  │  │  WebSocket   ──►  /ws       ──►  backend-service:3000              │    │    │
│  │  │  Static     ──►  /*        ──►  frontend-service:80                │    │    │
│  │  │                                                                     │    │    │
│  │  │  ┌─────────────────────────────────────────────────────────────┐    │    │    │
│  │  │  │              SECURITY FEATURES                              │    │    │    │
│  │  │  │  • SSL/TLS Termination                                     │    │    │    │
│  │  │  │  • Rate Limiting                                           │    │    │    │
│  │  │  │  • DDoS Protection                                         │    │    │    │
│  │  │  │  • CORS Headers                                            │    │    │    │
│  │  │  └─────────────────────────────────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND SERVICE LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                        NODE.JS EXPRESS SERVER                                 │    │
│  │                                                                             │    │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │    │
│  │  │                        REST API ENDPOINTS                            │    │    │
│  │  │                                                                     │    │    │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐    │    │    │
│  │  │  │   AUTH API  │  │  DATA API   │  │      ALERTS API             │    │    │    │
│  │  │  │             │  │             │  │                             │    │    │    │
│  │  │  │ POST /login │  │ GET /tickers│  │ POST   /alerts              │    │    │    │
│  │  │  │ POST /reg   │  │ GET /history│  │ GET    /alerts              │    │    │    │
│  │  │  │             │  │             │  │ DELETE /alerts/:id          │    │    │    │
│  │  │  │ JWT Token   │  │ Cache Hit?  │  │ Alert CRUD Operations       │    │    │    │
│  │  │  │ Generation  │  │ ┌─────────┐ │  │                             │    │    │    │
│  │  │  │             │  │ │   YES   │ │  │ ┌─────────────────────────┐    │    │    │
│  │  │  └─────────────┘  │ │ Return  │ │  │ │   Alert Validation     │    │    │    │
│  │  │                   │ │ Cached  │ │  │ │ • Valid ticker?        │    │    │    │
│  │  │                   │ │ Data    │ │  │ │ • Valid condition?     │    │    │    │
│  │  │                   │ └─────────┘ │  │ │ • Valid threshold?     │    │    │    │
│  │  │                   │             │  │ └─────────────────────────┘    │    │    │
│  │  │                   │ ┌─────────┐ │  │                             │    │    │    │
│  │  │                   │ │   NO    │ │  └─────────────────────────────┘    │    │    │
│  │  │                   │ │Generate │ │                                     │    │    │
│  │  │                   │ │ & Cache │ │                                     │    │    │
│  │  │                   │ └─────────┘ │                                     │    │    │
│  │  │                   └─────────────┘                                     │    │    │
│  │  └─────────────────────────────────────────────────────────────────────┘    │    │
│  │                                                                             │    │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │    │
│  │  │                      WEBSOCKET SERVER                               │    │    │
│  │  │                                                                     │    │    │
│  │  │  ┌─────────────────────────────────────────────────────────────┐    │    │    │
│  │  │  │                 CONNECTION MANAGEMENT                        │    │    │    │
│  │  │  │                                                             │    │    │    │
│  │  │  │  Client Connects ──► Assign ID ──► Store Connection           │    │    │    │
│  │  │  │       │                                                   │    │    │    │
│  │  │  │       ▼                                                   │    │    │    │
│  │  │  │  Subscribe Message ──► Filter Tickers ──► Update Subscription │    │    │    │
│  │  │  │       │                                                   │    │    │    │
│  │  │  │       ▼                                                   │    │    │    │
│  │  │  │  Real-time Updates ──► Broadcast to Subscribed Clients       │    │    │    │
│  │  │  │                                                             │    │    │    │
│  │  │  └─────────────────────────────────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               BUSINESS LOGIC LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                            MARKET DATA ENGINE                                │    │
│  │                                                                             │    │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │    │
│  │  │                      PRICE SIMULATOR                                │    │    │
│  │  │                                                                     │    │    │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐    │    │    │
│  │  │  │   AAPL      │  │   TSLA      │  │         BTC                 │    │    │    │
│  │  │  │  $150.25    │  │  $250.50    │  │      $45,000                │    │    │    │
│  │  │  │     │       │  │     │       │  │         │                   │    │    │    │
│  │  │  │     ▼       │  │     ▼       │  │         ▼                   │    │    │    │
│  │  │  │  $150.75    │  │  $251.20    │  │     $45,150                 │    │    │    │
│  │  │  │  (+0.33%)   │  │  (+0.28%)   │  │    (+0.33%)                 │    │    │    │
│  │  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘    │    │    │
│  │  │                                                                     │    │    │
│  │  │  • Random walk algorithm with configurable volatility               │    │    │    │
│  │  │  • Updates every 1 second (configurable)                          │    │    │    │
│  │  │  • Generates realistic price movements                             │    │    │    │
│  │  └─────────────────────────────────────────────────────────────────────┘    │    │
│  │                                                                             │    │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │    │
│  │  │                        ALERT ENGINE                                 │    │    │
│  │  │                                                                     │    │    │
│  │  │  ┌─────────────────────────────────────────────────────────────┐    │    │    │
│  │  │  │                  ALERT CONDITIONS                             │    │    │    │
│  │  │  │                                                             │    │    │    │
│  │  │  │  Alert: AAPL > $150   Current: $150.75    ──► TRIGGERED!     │    │    │    │
│  │  │  │  Alert: TSLA < $240   Current: $251.20    ──► NOT MET       │    │    │    │
│  │  │  │  Alert: BTC > $46,000 Current: $45,150    ──► NOT MET       │    │    │    │
│  │  │  │                                                             │    │    │    │
│  │  │  │  ┌─────────────────────────────────────────────────────┐    │    │    │    │
│  │  │  │  │              ALERT TRIGGER FLOW                   │    │    │    │    │
│  │  │  │  │                                                     │    │    │    │
│  │  │  │  │  Price Update ──► Check Alerts ──► Condition Met?    │    │    │    │
│  │  │  │  │       │               │              │              │    │    │    │
│  │  │  │  │       ▼               ▼              ▼              │    │    │    │
│  │  │  │  │  Update History   Mark Alerted   Send WebSocket    │    │    │    │
│  │  │  │  │                   as Triggered     Notification     │    │    │    │
│  │  │  │  └─────────────────────────────────────────────────────┘    │    │    │    │
│  │  │  └─────────────────────────────────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               DATA STORAGE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                          IN-MEMORY STORAGE                                  │    │
│  │                                                                             │    │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │    │
│  │  │                      PRICE HISTORY                                   │    │    │
│  │  │                                                                     │    │    │
│  │  │  AAPL: [{time: "13:00:00", price: 150.00},                           │    │    │    │
│  │  │        {time: "13:00:01", price: 150.25},                           │    │    │    │
│  │  │        {time: "13:00:02", price: 150.75}, ...]                      │    │    │    │
│  │  │                                                                     │    │    │    │
│  │  │  TSLA: [{time: "13:00:00", price: 250.00},                           │    │    │    │
│  │  │        {time: "13:00:01", price: 250.50}, ...]                      │    │    │    │
│  │  │                                                                     │    │    │    │
│  │  │  • Rolling window of last 50 points per ticker                       │    │    │    │
│  │  │  • Automatic cleanup of old data                                     │    │    │    │
│  │  └─────────────────────────────────────────────────────────────────────┘    │    │
│  │                                                                             │    │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │    │
│  │  │                        CACHE LAYER                                   │    │    │
│  │  │                                                                     │    │    │
│  │  │  ┌─────────────────────────────────────────────────────────────┐    │    │    │
│  │  │  │                  TTL CACHE (60 seconds)                     │    │    │    │
│  │  │  │                                                             │    │    │    │
│  │  │  │  Key: "AAPL_history"  Value: [cached data]  TTL: 45s       │    │    │    │
│  │  │  │  Key: "TSLA_history"  Value: [cached data]  TTL: 32s       │    │    │    │
│  │  │  │  Key: "BTC_history"   Value: [cached data]  TTL: 58s       │    │    │    │
│  │  │  │                                                             │    │    │    │
│  │  │  │  • Reduces database queries                                 │    │    │    │
│  │  │  │  • Improves response time                                   │    │    │    │
│  │  │  │  • Automatic expiration                                      │    │    │    │
│  │  │  └─────────────────────────────────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────────────────────────────────┘    │    │
│  │                                                                             │    │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │    │    │
│  │  │                       ALERT STORAGE                                   │    │    │    │
│  │  │                                                                     │    │    │    │
│  │  │  ┌─────────────────────────────────────────────────────────────┐    │    │    │    │
│  │  │  │                    ACTIVE ALERTS                             │    │    │    │
│  │  │  │                                                             │    │    │    │
│  │  │  │  [{id: "uuid1", ticker: "AAPL", condition: "above",         │    │    │    │
│  │  │  │    threshold: 150, triggered: false, createdAt: "..."}]      │    │    │    │
│  │  │  │                                                             │    │    │    │
│  │  │  │  [{id: "uuid2", ticker: "TSLA", condition: "below",         │    │    │    │
│  │  │  │    threshold: 240, triggered: false, createdAt: "..."}]      │    │    │    │
│  │  │  └─────────────────────────────────────────────────────────────┘    │    │    │
│  │  │                                                                     │    │    │    │
│  │  │  ┌─────────────────────────────────────────────────────────────┐    │    │    │    │
│  │  │  │                  TRIGGERED ALERTS                            │    │    │    │
│  │  │  │                                                             │    │    │    │
│  │  │  │  [{id: "uuid3", ticker: "AAPL", condition: "above",         │    │    │    │
│  │  │  │    threshold: 150, triggered: true, triggeredAt: "..."}]     │    │    │    │
│  │  │  └─────────────────────────────────────────────────────────────┘    │    │    │    │
│  │  └─────────────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Detailed Workflow Steps

### 1. User Authentication Flow

```
Step 1: User Access
┌─────────────────┐
│ User opens      │
│ browser app     │
└─────────┬───────┘
          ▼
┌─────────────────┐
│ Check for       │
│ existing token  │
│ in localStorage │
└─────────┬───────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌─────────┐ ┌─────────────┐
│ Token   │ │ No Token    │
│ Valid?  │ │ Found       │
└─────┬───┘ └──────┬──────┘
      │           │
      ▼           ▼
┌─────────┐ ┌─────────────┐
│ Show    │ │ Show Login  │
│ Dashboard│ │ Page        │
└─────────┘ └──────┬──────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│ User enters credentials             │
│ ┌─────────────┐ ┌─────────────────┐ │
│ │ Username    │ │ Password        │ │
│ │ john.doe    │ │ •••••••••••     │ │
│ └─────────────┘ └─────────────────┘ │
│              [Login/Register]      │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ POST /login or /register            │
│ ┌─────────────────────────────────┐ │
│ │ { username, password }           │ │
│ └─────────────────────────────────┘ │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Backend Authentication              │
│ • Validate credentials             │
│ • Hash password comparison          │
│ • Generate JWT token                │
│ • Return user info + token          │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Store token in localStorage         │
│ Redirect to dashboard               │
└─────────────────────────────────────┘
```

### 2. Real-time Data Flow

```
Step 2: Market Data Simulation
┌─────────────────────────────────────┐
│ Price Simulator (1-second interval) │
│ ┌─────────────────────────────────┐ │
│ │ Current: AAPL $150.25           │ │
│ │ Volatility: 0.1%                │ │
│ │ New Price: $150.75 (+0.33%)     │ │
│ └─────────────────────────────────┘ │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Update In-Memory Storage            │
│ • Update current price              │
│ • Add to history array              │
│ • Remove old data (max 50 points)  │
│ • Invalidate cache                  │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Check Alert Conditions              │
│ ┌─────────────────────────────────┐ │
│ │ Alert: AAPL > $150              │ │
│ │ Current: $150.75                │ │
│ │ Result: TRIGGERED!              │ │
│ └─────────────────────────────────┘ │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Broadcast Updates                   │
│ ┌─────────────────────────────────┐ │
│ │ WebSocket Message:              │ │
│ │ { ticker: "AAPL",               │ │
│ │   price: 150.75,                │ │
│ │   time: "13:00:02" }            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Alert Message:                  │ │
│ │ { type: "alert",                │ │
│ │   ticker: "AAPL",               │ │
│ │   condition: "above",           │ │
│ │   threshold: 150,               │ │
│ │   price: 150.75 }               │ │
│ └─────────────────────────────────┘ │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Client Receives Updates             │
│ • Update price display              │
│ • Flash price change animation      │
│ • Update chart with new point       │
│ • Show alert toast notification     │
└─────────────────────────────────────┘
```

### 3. Historical Data Request Flow

```
Step 3: Historical Data Request
┌─────────────────────────────────────┐
│ User selects ticker or loads chart  │
│ Request: GET /history/AAPL?limit=50 │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Backend API receives request         │
│ • Validate JWT token                │
│ • Parse query parameters            │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Check Cache First                   │
│ ┌─────────────────────────────────┐ │
│ │ Key: "AAPL_history"             │ │
│ │ Found? YES                      │ │
│ │ TTL remaining? 45 seconds       │ │
│ │ Status: CACHE HIT               │ │
│ └─────────────────────────────────┘ │
└─────────────────┬───────────────────┘
                  │
          ┌───────┴───────┐
          │               │
          ▼               ▼
┌─────────────┐  ┌─────────────────────┐
│ Return      │  │ Cache Miss         │
│ Cached Data │  │                     │
│ (Fast)      │  │ • Generate from     │
│             │  │   live history      │
│             │  │ • Store in cache    │
│             │  │ • Return to client  │
└─────────────┘  └─────────────────────┘
```

### 4. Alert Management Flow

```
Step 4: Alert Creation and Management
┌─────────────────────────────────────┐
│ User creates new alert              │
│ ┌─────────────────────────────────┐ │
│ │ Ticker: AAPL                    │ │
│ │ Condition: Above                │ │
│ │ Threshold: $155                 │ │
│ │ [Create Alert]                  │ │
│ └─────────────────────────────────┘ │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ POST /alerts                        │
│ ┌─────────────────────────────────┐ │
│ │ { ticker: "AAPL",               │ │
│ │   condition: "above",           │ │
│ │   threshold: 155 }              │ │
│ └─────────────────────────────────┘ │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Backend Validation                  │
│ • Is ticker valid? ✓               │
│ • Is condition valid? ✓             │
│ • Is threshold positive? ✓         │
│ • Generate unique ID                │
│ • Store in alerts collection        │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Return Success Response              │
│ ┌─────────────────────────────────┐ │
│ │ { id: "uuid", ticker: "AAPL",   │ │
│ │   condition: "above",           │ │
│ │   threshold: 155,               │ │
│ │   createdAt: "...",             │ │
│ │   triggered: false }            │ │
│ └─────────────────────────────────┘ │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Update UI Alert List                │
│ • Show new alert in manager         │
│ • Alert is now active for monitoring│
└─────────────────────────────────────┘

Alert Triggering:
┌─────────────────────────────────────┐
│ Price reaches $155.50               │
│ Alert condition met: AAPL > $155    │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Alert Engine Triggers                │
│ • Mark alert as triggered            │
│ • Send WebSocket notification        │
│ • Update alert status in storage     │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Client Shows Toast Notification      │
│ ┌─────────────────────────────────┐ │
│ │ ⚠️ AAPL above $155!            │ │
│ │ Price: $155.50                  │ │
│ │ [Dismiss]                       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 5. WebSocket Connection Management

```
Step 5: WebSocket Lifecycle
┌─────────────────────────────────────┐
│ Client Connects to WebSocket        │
│ ws://localhost:3000                 │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Server Accepts Connection            │
│ • Assign unique connection ID        │
│ • Set subscription to null (all)    │
│ • Add to active connections list    │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Client May Send Subscription         │
│ ┌─────────────────────────────────┐ │
│ │ { type: "subscribe",           │ │
│ │   tickers: ["AAPL", "TSLA"] }  │ │
│ └─────────────────────────────────┘ │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Server Updates Subscription          │
│ • Filter valid tickers               │
│ • Store subscription preferences     │
│ • Send acknowledgment               │
│ ┌─────────────────────────────────┐ │
│ │ { type: "subscribed",           │ │
│ │   tickers: ["AAPL", "TSLA"],   │ │
│ │   timestamp: "..." }            │ │
│ └─────────────────────────────────┘ │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Selective Broadcasting              │
│ • AAPL update → Send to client      │
│ • TSLA update → Send to client      │
│ • BTC update → Don't send (not sub) │
│ • Alerts → Always send              │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│ Graceful Disconnection               │
│ • Remove from active connections    │
│ • Cleanup subscription data         │
│ • Log disconnection event            │
└─────────────────────────────────────┘
```

## Key Performance Features

### 1. Caching Strategy
- **TTL Cache**: 60-second cache for historical data
- **Cache Headers**: `X-Cache: HIT/MISS` for debugging
- **Invalidation**: Automatic cache invalidation on new data

### 2. Real-time Optimizations
- **Selective Broadcasting**: Only send relevant ticker updates
- **Connection Pooling**: Efficient WebSocket connection management
- **Message Queuing**: Prevent message loss during high frequency

### 3. Frontend Performance
- **React.memo**: Prevent unnecessary re-renders
- **Debouncing**: Smooth user interactions
- **Lazy Loading**: Code splitting for better initial load

### 4. Backend Performance
- **Rate Limiting**: Prevent API abuse
- **Memory Management**: Automatic cleanup of old data
- **Efficient Data Structures**: Optimized for fast lookups

This workflow documentation provides a comprehensive view of how the Trading Dashboard application functions, from user interactions to data processing and real-time updates. Each component is designed to work seamlessly with others to provide a smooth, responsive user experience.
