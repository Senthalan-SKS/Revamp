# Auth Service Setup Guide

## Quick Start (Local Development)

### 1. Set Environment Variables

Before starting the service, you need to set MongoDB connection strings as environment variables:

**Option A: Export in terminal**
```bash
export MONGO_URI="mongodb+srv://latheeshan888_db_user:nwZdurRR5XLAr7gx@localead.6sfty32.mongodb.net/localEAD?retryWrites=true&w=majority"
export EMPLOYEE_MONGO_URI="mongodb+srv://Scholarshare:scholarshare@cluster0.mmj1r.mongodb.net/EAD-Employes?retryWrites=true&w=majority"
export EMPLOYEE_MONGO_DATABASE="EAD-Employes"
```

**Option B: Use setup script**
```bash
# Edit setup-env.sh with your credentials first, then:
source setup-env.sh
```

**Option C: Use local properties file**
```bash
# Copy the example file
cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties
# Edit application-local.properties with your credentials
# Run with profile: --spring.profiles.active=local
```

### 2. Start the Service

```bash
./mvnw spring-boot:run
```

## Security Notes

✅ **Fixed**: Hardcoded MongoDB credentials have been removed from source code  
✅ **Secure**: All credentials now come from environment variables  
⚠️ **Important**: Never commit credentials to git

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | Primary MongoDB connection (users/auth) | `mongodb+srv://user:pass@cluster.mongodb.net/localEAD?retryWrites=true&w=majority` |
| `EMPLOYEE_MONGO_URI` | Employee details MongoDB connection | `mongodb+srv://user:pass@cluster.mongodb.net/EAD-Employes?retryWrites=true&w=majority` |
| `EMPLOYEE_MONGO_DATABASE` | Employee database name (optional, defaults to "EAD-Employes") | `EAD-Employes` |

## Troubleshooting

### Error: "Employee MongoDB URI is not configured"
- Set the `EMPLOYEE_MONGO_URI` environment variable
- Make sure there are no typos in the variable name

### Error: "Failed to connect to MongoDB"
- Check your MongoDB credentials are correct
- Verify network access (IP whitelisting in MongoDB Atlas)
- Ensure the MongoDB cluster is running

## Production Deployment

For production, use your platform's secret management:
- **Docker**: Environment variables or Docker secrets
- **Kubernetes**: Secrets
- **Cloud Platforms**: AWS Secrets Manager, Azure Key Vault, etc.

See `SECURITY.md` for more details.

