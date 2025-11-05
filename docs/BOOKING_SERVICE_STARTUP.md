# Booking Service Startup Guide

## Issue: Gateway Error - "fetch failed"

This error occurs when the gateway tries to forward requests to the booking service, but the booking service is not running.

## Solution: Start the Booking Service

### Step 1: Navigate to Booking Service Directory

```bash
cd /Users/lisorthman/Desktop/Revamp/services/bookingservice
```

### Step 2: Start the Service

**Option A: Using Maven Wrapper (Recommended)**
```bash
./mvnw spring-boot:run
```

**Option B: Using Start Script**
```bash
./start.sh
```

**Option C: Using Maven (if installed)**
```bash
mvn spring-boot:run
```

### Step 3: Wait for Service to Start

The service will:
1. Download Maven dependencies (first time only - can take 2-5 minutes)
2. Compile the code
3. Connect to MongoDB
4. Start on port 8084

**Look for this message:**
```
Started BookingApplication in X.XXX seconds
```

### Step 4: Verify Service is Running

**Check if service is listening on port 8084:**
```bash
lsof -i :8084
```

**Or test the endpoint directly:**
```bash
curl http://localhost:8084/api/bookings/timeslots/check-availability/2025-11-08
```

**Or use the status check script:**
```bash
./check-status.sh
```

### Step 5: Test Through Gateway

Once the service is running, test through the gateway:
```bash
curl http://localhost:4000/api/bookings/timeslots/check-availability/2025-11-08
```

## Service Configuration

- **Port:** 8084
- **Database:** EAD-Bookings (MongoDB)
- **Connection:** MongoDB Atlas cluster

## Troubleshooting

### Issue: Port 8084 already in use

**Solution:** Stop the service using that port:
```bash
lsof -ti:8084 | xargs kill -9
```

### Issue: MongoDB connection error

**Solution:** Check the connection string in `src/main/resources/application.properties`:
```
spring.data.mongodb.uri=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/EAD-Bookings?retryWrites=true&w=majority
```

### Issue: Maven dependencies not downloading

**Solution:** Check internet connection and Maven settings. First run can take 5-10 minutes to download all dependencies.

### Issue: Java version error

**Solution:** Ensure Java 21 is installed:
```bash
java -version
```

Should show version 21 or higher.

## Running in Background

To run the service in the background:

```bash
nohup ./mvnw spring-boot:run > booking-service.log 2>&1 &
```

Check logs:
```bash
tail -f booking-service.log
```

Stop the service:
```bash
lsof -ti:8084 | xargs kill
```

## Quick Start Summary

1. `cd services/bookingservice`
2. `./mvnw spring-boot:run`
3. Wait for "Started BookingApplication" message
4. Test: `curl http://localhost:8084/api/bookings/timeslots/check-availability/2025-11-08`
5. Test through gateway: `curl http://localhost:4000/api/bookings/timeslots/check-availability/2025-11-08`

