#!/bin/bash
# Setup script for MongoDB environment variables
# SECURITY: Replace the placeholders below with your actual MongoDB credentials
# Run this before starting the auth service: source setup-env.sh

# Primary MongoDB connection (for users/auth)
# Replace with your actual MongoDB URI
export MONGO_URI="mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/localEAD?retryWrites=true&w=majority"

# Employee Details MongoDB connection
# Replace with your actual MongoDB URI
export EMPLOYEE_MONGO_URI="mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/EAD-Employes?retryWrites=true&w=majority"
export EMPLOYEE_MONGO_DATABASE="EAD-Employes"

echo "Environment variables set. You can now start the application."
echo "To persist these, add them to your shell profile (.zshrc, .bashrc, etc.)"
echo ""
echo "WARNING: Make sure to replace USERNAME and PASSWORD with your actual credentials!"

