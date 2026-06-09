---
name: check-deployment
description: 'Verify frontend and backend are running and accessible. Returns service health status.'
---

Check if application services are running and accessible.

## Ports
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Execution

```bash
# Check backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs 2>/dev/null || echo "DOWN")

# Check frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "DOWN")

echo "Backend: $BACKEND_STATUS"
echo "Frontend: $FRONTEND_STATUS"
```

## Output

```
✅ Backend: Running (200)
✅ Frontend: Running (200)
Ready for testing

OR

❌ Backend: DOWN
❌ Frontend: DOWN
Run: docker-compose up -d
```

Auto-start services if down (ask user first):
```bash
docker-compose up -d
# Wait 30s for startup
```
