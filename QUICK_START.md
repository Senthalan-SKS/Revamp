# Quick Start Guide

## Prerequisites
- MongoDB connection string (Atlas or local)
- Node.js installed
- Java 21 installed (or use Maven wrapper)

## Step 1: Configure MongoDB

### Option A: Using Environment Variables (Recommended)

Edit `services/authservice/setup-env.sh` with your MongoDB credentials:

```bash
export MONGO_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/localEAD?retryWrites=true&w=majority"
export EMPLOYEE_MONGO_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/EAD-Employes?retryWrites=true&w=majority"
export EMPLOYEE_MONGO_DATABASE="EAD-Employes"
```

Then source it:
```bash
cd services/authservice
source setup-env.sh
```

### Option B: Using Local Properties File

Copy the example file:
```bash
cd services/authservice/src/main/resources
cp application-local.properties.example application-local.properties
```

Edit `application-local.properties` with your MongoDB URIs, then run with:
```bash
./mvnw spring-boot:run --spring.profiles.active=local
```

## Step 2: Start Backend Services

### Terminal 1: Auth Service

**Option A: Using the startup script (Recommended)**
```bash
cd services/authservice
# Make sure MongoDB env vars are set (see Step 1)
./start.sh
```

**Option B: Manual start**
```bash
cd services/authservice
# Set MongoDB env vars first (see Step 1)
./mvnw spring-boot:run
```

Wait for: `Started AuthApplication in X seconds`

**⚠️ If you see "BUILD FAILURE" or "Process terminated with exit code: 1":**
- Check that `MONGO_URI` environment variable is set
- Run: `./start.sh` which will check and show helpful error messages

### Terminal 2: Gateway
```bash
cd gateway
npm run dev
```

Wait for: `Gateway running on port 4000`

## Step 3: Start Frontend

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```

Open: http://localhost:3000

## Troubleshooting

### "500 Error" when loading employees:
- ✅ Check backend is running: `curl http://localhost:8081/api/auth/employees`
- ✅ Verify MongoDB environment variables are set
- ✅ Check backend logs for MongoDB connection errors
- ✅ Ensure MongoDB cluster allows connections from your IP

### "Failed to connect to gateway":
- ✅ Check gateway is running on port 4000
- ✅ Verify `NEXT_PUBLIC_GATEWAY_URL` in frontend (defaults to http://localhost:4000)

### "Permission denied" for nodemon:
- ✅ Run: `chmod +x gateway/node_modules/.bin/nodemon`

### Backend won't start:
- ✅ Ensure `MONGO_URI` environment variable is set
- ✅ Check MongoDB connection string format
- ✅ Verify Java 21 is installed: `java -version`

