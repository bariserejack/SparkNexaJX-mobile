# SparkNexa API (Local)

Minimal Node API scaffold wired to local Docker services:

- Postgres
- MongoDB
- Redis

## 1) Install deps

```bash
npm --prefix services/api install
```

## 2) Configure env

```bash
copy services\\api\\.env.example services\\api\\.env
```

Add your OpenAI key in `services/api/.env`:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

## 3) Start infra (from repo root)

```bash
npm run infra:up
```

## 4) Start API

```bash
npm run api:dev
```

## 5) Verify

```bash
curl http://localhost:4000/health
curl http://localhost:4000/health/deps
curl -X POST http://localhost:4000/api/nexa/qa -H "Content-Type: application/json" -d "{\"question\":\"Explain photosynthesis in one sentence.\"}"
```

## Projects endpoint (Postgres-backed)

```bash
curl http://localhost:4000/api/projects
curl -X POST http://localhost:4000/api/projects -H "Content-Type: application/json" -d "{\"title\":\"First Project\"}"
curl -X PUT http://localhost:4000/api/projects/1 -H "Content-Type: application/json" -d "{\"status\":\"done\"}"
curl -X DELETE http://localhost:4000/api/projects/1
```

PowerShell examples:

```powershell
Invoke-RestMethod http://localhost:4000/api/projects
Invoke-RestMethod -Method Post http://localhost:4000/api/projects -ContentType "application/json" -Body '{"title":"First Project","status":"building"}'
Invoke-RestMethod -Method Put http://localhost:4000/api/projects/1 -ContentType "application/json" -Body '{"status":"done"}'
Invoke-RestMethod -Method Delete http://localhost:4000/api/projects/1
```

PowerShell env var syntax (temporary in current terminal):

```powershell
$env:EXPO_PUBLIC_API_URL = "http://localhost:4000"
```

## If port 4000 is busy (Windows PowerShell)

```powershell
Get-NetTCPConnection -LocalPort 4000 | Select-Object OwningProcess, LocalAddress, LocalPort, State
Stop-Process -Id <PID> -Force
```

## 6) Stop infra when done

```bash
npm run infra:down
```
