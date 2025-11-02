#!/bin/bash
# Quick start script for auth service
# This script checks for MongoDB configuration and starts the service

echo "=========================================="
echo "Auth Service Startup Script"
echo "=========================================="
echo ""

# Check if MONGO_URI is set
if [ -z "$MONGO_URI" ]; then
    echo "❌ ERROR: MONGO_URI environment variable is not set!"
    echo ""
    echo "Please set your MongoDB connection string:"
    echo "  export MONGO_URI=\"mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/localEAD?retryWrites=true&w=majority\""
    echo ""
    echo "Or use the setup script:"
    echo "  source setup-env.sh"
    echo ""
    echo "Or create application-local.properties and run with:"
    echo "  ./mvnw spring-boot:run --spring.profiles.active=local"
    echo ""
    exit 1
fi

echo "✓ MONGO_URI is set"
if [ -z "$EMPLOYEE_MONGO_URI" ]; then
    echo "⚠ WARNING: EMPLOYEE_MONGO_URI is not set. Employee details features will be disabled."
    echo "  To enable: export EMPLOYEE_MONGO_URI=\"mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/EAD-Employes?retryWrites=true&w=majority\""
else
    echo "✓ EMPLOYEE_MONGO_URI is set"
fi

echo ""
echo "Starting auth service..."
echo "=========================================="
echo ""

# Start the service
./mvnw spring-boot:run

