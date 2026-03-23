# Trading Dashboard

A real-time trading dashboard microservice — **Node.js backend** with WebSocket price streaming + **React frontend** with live charts and price-threshold alerts.

## Architecture

```
Browser
  │
  ▼
Nginx Ingress (K8s)
  ├── /api/*  ──► backend-svc:3000  (REST API)
  ├── /ws    ──► backend-svc:3000  (WebSocket)
  └── /      ──► frontend-svc:80  (React SPA)
```

## Running Locally

### Prerequisites
- Node.js 20+

```bash
# Backend
cd backend && npm install && npm start
# → http://localhost:3000

# Frontend (new terminal)
cd frontend && npm install && npm run dev
# → http://localhost:5173
```

### Backend API

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/tickers` | List available tickers |
| `GET` | `/history/:ticker?limit=N` | Historical price data (cached, `X-Cache` header) |
| `POST` | `/alerts` | Create price threshold alert `{ticker, condition, threshold}` |
| `GET` | `/alerts` | List all alerts |
| `DELETE` | `/alerts/:id` | Remove an alert |
| `GET` | `/health` | Server health + cache stats |
| `WS` | `ws://localhost:3000` | Real-time price stream |

### Running Tests

```bash
cd backend
node --test server.test.js
# → 24/24 tests pass
```

---

## Docker

```bash
# Build images
docker build -t trading-dashboard/backend:latest ./backend
docker build -t trading-dashboard/frontend:latest ./frontend

# Run with docker-compose
docker compose up
# Backend: http://localhost:3000
# Frontend: http://localhost:80
```

---

## Kubernetes Deployment

### Prerequisites
- `kubectl` configured against a cluster
- Nginx Ingress Controller installed ([install guide](https://kubernetes.github.io/ingress-nginx/deploy/))
- Metrics Server (for HPA) — `kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml`

### 1. Build & load images

**Minikube:**
```bash
eval $(minikube docker-env)   # point Docker daemon to minikube
docker build -t trading-dashboard/backend:latest ./backend
docker build -t trading-dashboard/frontend:latest ./frontend
```

**kind:**
```bash
docker build -t trading-dashboard/backend:latest ./backend
docker build -t trading-dashboard/frontend:latest ./frontend
kind load docker-image trading-dashboard/backend:latest
kind load docker-image trading-dashboard/frontend:latest
```

### 2. Deploy (Kustomize)

```bash
# Dry-run first
kubectl apply --dry-run=client -k k8s/

# Apply everything
kubectl apply -k k8s/
```

### 3. Verify

```bash
kubectl get all -n trading-dashboard

# Wait for rollouts
kubectl rollout status deployment/backend  -n trading-dashboard
kubectl rollout status deployment/frontend -n trading-dashboard

# Check HPA
kubectl get hpa -n trading-dashboard
```

### 4. Access

**Minikube:**
```bash
minikube tunnel   # run in a separate terminal
# Then visit http://localhost
```

**kind / cloud cluster:**
```bash
kubectl get ingress -n trading-dashboard
# Use the EXTERNAL-IP or configure /etc/hosts
```

### Kubernetes Manifest Overview

```
k8s/
├── kustomization.yaml        # entry point — kubectl apply -k k8s/
├── namespace.yaml            # trading-dashboard namespace
├── configmap.yaml            # shared env vars (NODE_ENV, PORT)
├── ingress.yaml              # HTTP + WebSocket routing
├── hpa.yaml                  # backend autoscaler (CPU 70%, 1–5 replicas)
├── backend/
│   ├── deployment.yaml       # 2 replicas, /health probes, resource limits
│   └── service.yaml          # ClusterIP :3000
└── frontend/
    ├── deployment.yaml       # 2 replicas, /nginx-health probes
    └── service.yaml          # ClusterIP :80
```

### Updating Image Tags (CI/CD)

```bash
cd k8s
kustomize edit set image trading-dashboard/backend=myregistry/backend:v1.2.3
kustomize edit set image trading-dashboard/frontend=myregistry/frontend:v1.2.3
kubectl apply -k .
```

---

## Assumptions & Trade-offs

- **In-memory state** — price history, alerts, and cache are all in-process. In production, replace with Redis/TimescaleDB.
- **Single backend replica WebSocket** — with 2+ replicas, WebSocket connections are stateful. Add a sticky-session annotation or an external pub/sub (Redis Pub/Sub) for multi-replica WS.
- **imagePullPolicy: IfNotPresent** — manifests use local images for easy local dev. Change to `Always` with a registry path for production.
- **No TLS** — add a `cert-manager` ClusterIssuer and `tls` block to the Ingress for HTTPS in production.
- **Mock data** — all market data is simulated. Swap the price tick loop in `server.js` for a real market data provider.

## Bonus Features Implemented

- ✅ In-memory TTL cache for historical data (`X-Cache: HIT/MISS` headers)
- ✅ Per-ticker WebSocket subscribe/unsubscribe messages
- ✅ Price threshold alerts (REST CRUD + real-time WS push + frontend toast UI)
- ✅ Horizontal Pod Autoscaler (CPU + memory metrics)
- ✅ Zero-downtime rolling deployments
- ✅ Topology spread constraints for HA across nodes