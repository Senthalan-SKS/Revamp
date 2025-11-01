# Security Configuration Guide

## MongoDB Credentials

**IMPORTANT**: Never commit MongoDB credentials to the repository. They are detected by security scanners and pose a serious security risk.

### For Local Development

1. **Option 1: Environment Variables** (Recommended)
   
   Set these environment variables before running the application:
   ```bash
   export MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/localEAD?retryWrites=true&w=majority"
   export EMPLOYEE_MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/EAD-Employes?retryWrites=true&w=majority"
   export EMPLOYEE_MONGO_DATABASE="EAD-Employes"
   ```

2. **Option 2: Local Properties File**
   
   Copy `application-local.properties.example` to `application-local.properties` and fill in your credentials:
   ```bash
   cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties
   ```
   
   Then run with: `--spring.profiles.active=local`

### For Production

**ALWAYS** use environment variables or a secure secret management system:
- CI/CD platforms: Set secrets in pipeline configuration
- Docker: Use Docker secrets or environment variables
- Kubernetes: Use Secrets
- Cloud platforms: Use their secret management services (AWS Secrets Manager, Azure Key Vault, etc.)

### Current Configuration

The application currently requires:
- `MONGO_URI` - Primary MongoDB connection (for users/auth)
- `EMPLOYEE_MONGO_URI` - Employee details MongoDB connection
- `EMPLOYEE_MONGO_DATABASE` - Employee database name (defaults to "EAD-Employes")

If these are not set, the application will fail to start with a clear error message.

### Rotating Credentials

If credentials are exposed:
1. **Immediately** rotate/change the MongoDB passwords
2. Update all environment variables and configuration files
3. Restart all services
4. Verify the application works with new credentials

