# Prediction Market Simulator Deploy Guide

## Overview

This server setup currently uses:

- **Frontend:** React + Vite build served by **Nginx**
- **Backend:** Spring Boot **JAR** running as a **systemd service**
- **Database:** PostgreSQL running in **Docker Compose**
- **Public entrypoint:** `http://193.40.157.190`
- **API routing:** Nginx proxies `/api/*` to backend on `127.0.0.1:8080`

## Current Server Structure

```bash
/var/www/
  ├── html/                                # Nginx-served frontend build
  └── prediction-market-simulator/
        ├── backend/
        │   ├── target/backend-0.0.1-SNAPSHOT.jar
        │   └── src/main/resources/application.properties
        ├── frontend/
        │   ├── dist/
        │   ├── .env
        │   └── package.json
        └── docker-compose.yml
```

## Services

### Nginx
Serves frontend from:

```bash
/var/www/html
```

Nginx also proxies:

```bash
/api/ -> http://127.0.0.1:8080/api/
```

### Backend
Runs as systemd service:

```bash
pms-backend
```

Service file:

```bash
/etc/systemd/system/pms-backend.service
```

### Database
Runs with Docker Compose from project root:

```bash
/var/www/prediction-market-simulator/docker-compose.yml
```

Current DB container:

```bash
pms-postgres
```

## Important Config Files

### Frontend env
File:

```bash
/var/www/prediction-market-simulator/frontend/.env
```

Current value:

```env
VITE_API_BASE_URL=/api
```

### Backend application config
File:

```bash
/var/www/prediction-market-simulator/backend/src/main/resources/application.properties
```

Backend must contain valid PostgreSQL datasource config.

### Nginx config
File:

```bash
/etc/nginx/sites-available/default
```

Current working config:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## First-Time Setup Summary

### Clone repo
```bash
cd /var/www
git clone <REPO_SSH_OR_HTTPS_URL>
```

### Start database
```bash
cd /var/www/prediction-market-simulator
docker compose up -d --build
```

### Frontend setup
```bash
cd /var/www/prediction-market-simulator/frontend
npm install
printf 'VITE_API_BASE_URL=/api\n' > .env
npm run build
sudo rm -rf /var/www/html/* && sudo cp -r dist/* /var/www/html/
```

### Backend setup
```bash
cd /var/www/prediction-market-simulator/backend
chmod +x mvnw
./mvnw clean package -DskipTests
```

### Backend systemd service
```bash
sudo tee /etc/systemd/system/pms-backend.service > /dev/null << 'EOF'
[Unit]
Description=Prediction Market Simulator Backend
After=network.target docker.service
Requires=docker.service

[Service]
User=ubuntu
WorkingDirectory=/var/www/prediction-market-simulator/backend
ExecStart=/usr/bin/java -jar /var/www/prediction-market-simulator/backend/target/backend-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

Then enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now pms-backend
```

## Daily Operations

### Check backend status
```bash
systemctl status pms-backend --no-pager
```

### Restart backend
```bash
sudo systemctl restart pms-backend
```

### Backend logs
```bash
journalctl -u pms-backend -n 100 --no-pager
```

### Live backend logs
```bash
journalctl -u pms-backend -f
```

### Check Nginx
```bash
systemctl status nginx --no-pager
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

### Test backend locally
```bash
curl -i http://127.0.0.1:8080/api/markets
```

### Test frontend locally on server
```bash
curl http://127.0.0.1
```

### Check DB container
```bash
docker compose -f /var/www/prediction-market-simulator/docker-compose.yml ps
```

### View DB logs
```bash
docker compose -f /var/www/prediction-market-simulator/docker-compose.yml logs --tail=100
```

## Frontend Deploy

Use this when frontend code changes:

```bash
cd /var/www/prediction-market-simulator
git pull

cd frontend
npm install
npm run build

sudo rm -rf /var/www/html/* && sudo cp -r dist/* /var/www/html/
```

## Backend Deploy

Use this when backend code changes:

```bash
cd /var/www/prediction-market-simulator
git pull

cd backend
./mvnw clean package -DskipTests
sudo systemctl restart pms-backend
```

## Full Deploy

Use this when both frontend and backend change:

```bash
cd /var/www/prediction-market-simulator
git pull

cd backend
./mvnw clean package -DskipTests
sudo systemctl restart pms-backend

cd ../frontend
npm install
npm run build
sudo rm -rf /var/www/html/* && sudo cp -r dist/* /var/www/html/
```

## Database Commands

### Start DB
```bash
cd /var/www/prediction-market-simulator
docker compose up -d
```

### Stop DB
```bash
cd /var/www/prediction-market-simulator
docker compose down
```

### Restart DB
```bash
cd /var/www/prediction-market-simulator
docker compose restart
```

## Common Problems

### Frontend loads but data fails
Check:

- backend service is running
- Nginx `/api` proxy exists
- frontend `.env` contains `VITE_API_BASE_URL=/api`
- frontend was rebuilt after env changes

### Site opens but API returns 502/404
Check:

```bash
systemctl status pms-backend --no-pager
journalctl -u pms-backend -n 100 --no-pager
curl -i http://127.0.0.1:8080/api/markets
```

### Backend works manually but dies after terminal closes
Cause:
- backend was started with `./mvnw spring-boot:run`

Fix:
- use systemd service `pms-backend`

### Frontend changes do not appear
Fix:
- rebuild frontend
- recopy `dist/` to `/var/www/html/`
- hard refresh browser

## Notes

- Frontend is static and served by Nginx
- Backend is not served from `/var/www/html`
- Backend runs independently as a Java service
- Database runs independently in Docker
- `VITE_API_BASE_URL` must be defined at **build time**
- If backend config changes, rebuild JAR and restart service
- If frontend env changes, rebuild frontend and redeploy `dist`

## Recommended Next Improvements

- add a real domain
- add HTTPS with Let's Encrypt
- move backend DB config to environment variables or systemd env file
- add CI/CD deploy script
- add Nginx access/error log review workflow
- add backend health endpoint
- add process monitoring and alerts
