# IBM Cloud Code Engine Deployment

This guide walks you through deploying the Db2 Survey Tool to IBM Cloud Code Engine.

## Prerequisites

1. IBM Cloud account
2. IBM Cloud CLI installed
3. Code Engine plugin installed
4. IBM Db2 instance (Db2 on Cloud or Db2 Warehouse)

## Setup Steps

### 1. Install IBM Cloud CLI

```bash
# macOS
curl -fsSL https://clis.cloud.ibm.com/install/osx | sh

# Login
ibmcloud login
```

### 2. Install Code Engine Plugin

```bash
ibmcloud plugin install code-engine
```

### 3. Create Code Engine Project

```bash
# Select your region
ibmcloud target -r us-south

# Create project
ibmcloud ce project create --name db2-survey

# Select the project
ibmcloud ce project select --name db2-survey
```

### 4. Set Up Db2 Connection

```bash
# Create secret for Db2 connection string
ibmcloud ce secret create --name db2-credentials \
  --from-literal DB2_CONN_STRING="DATABASE=bludb;HOSTNAME=your-host.db2.cloud.ibm.com;PORT=50001;PROTOCOL=TCPIP;UID=username;PWD=password;Security=SSL;"

# Create secret for OpenAI (optional)
ibmcloud ce secret create --name openai-key \
  --from-literal OPENAI_API_KEY="sk-your-key-here"
```

### 5. Build and Deploy

**Option A: Deploy from GitHub (Recommended)**

```bash
# Deploy application from GitHub repo
ibmcloud ce application create --name db2-survey-app \
  --build-source https://github.com/your-username/zora-customer-survey \
  --build-context-dir . \
  --strategy dockerfile \
  --port 3001 \
  --env-from-secret db2-credentials \
  --env-from-secret openai-key \
  --min-scale 1 \
  --max-scale 3 \
  --cpu 1 \
  --memory 2G
```

**Option B: Deploy from Local**

```bash
# Build the image locally
docker build -t db2-survey:latest .

# Push to IBM Container Registry
ibmcloud cr namespace-add db2-survey-ns
ibmcloud cr build -t us.icr.io/db2-survey-ns/db2-survey:latest .

# Deploy to Code Engine
ibmcloud ce application create --name db2-survey-app \
  --image us.icr.io/db2-survey-ns/db2-survey:latest \
  --port 3001 \
  --env-from-secret db2-credentials \
  --env-from-secret openai-key \
  --min-scale 1 \
  --max-scale 3 \
  --cpu 1 \
  --memory 2G
```

### 6. Initialize Database Schema

```bash
# Connect to your Db2 instance
db2 connect to BLUDB

# Run the schema setup
db2 -tvf server/db2-setup.sql

# Seed the initial configuration
# You'll need to update the connection string in server/.env
cd server
node seed-config.js
```

### 7. Get Application URL

```bash
ibmcloud ce application get --name db2-survey-app
```

Your app will be available at: `https://db2-survey-app.xxxxxx.us-south.codeengine.appdomain.cloud`

## Environment Variables

Set these in Code Engine:

- `DB2_CONN_STRING` - Your Db2 connection string (required)
- `OPENAI_API_KEY` - OpenAI API key for AI summaries (optional)
- `ADMIN_PASSWORD` - Dashboard password (defaults to admin2024)
- `PORT` - Will be set automatically by Code Engine

## Updating the App

```bash
# Rebuild and redeploy
ibmcloud ce application update --name db2-survey-app \
  --build-source https://github.com/your-username/zora-customer-survey
```

## Monitoring

```bash
# View logs
ibmcloud ce application logs --name db2-survey-app

# Get application status
ibmcloud ce application get --name db2-survey-app
```

## Scaling

Code Engine will auto-scale based on traffic:
- **min-scale: 1** - Always one instance running (fast response)
- **max-scale: 3** - Can scale up to 3 instances under load
- Scales to zero if needed (saves costs)

## Costs

- Code Engine: Pay per use (very affordable for internal tools)
- Db2 on Cloud: Based on your plan
- OpenAI API: Pay per token (optional feature)

## Notes

- The app serves both frontend (SPA) and backend (API) from the same container
- Static files served from `/dist`
- API routes handled by Express server
- Connection pooling ensures good performance
- HTTPS enabled automatically by Code Engine

