# Security Notice

## Important: Credential Rotation Required

⚠️ **CRITICAL**: MongoDB credentials were found in commit history (commit 7f5b9f2) in `services/authservice/README-SETUP.md`. 

### Immediate Actions Required:

1. **Rotate MongoDB Credentials Immediately**:
   - Log into MongoDB Atlas
   - Change passwords for:
     - `latheeshan888_db_user` 
     - `Scholarshare`
   - Update any services using these credentials

2. **Credentials are now removed from code**:
   - ✅ `setup-env.sh` - credentials removed and added to .gitignore
   - ✅ `README-SETUP.md` - file removed from repository
   - ✅ All new commits use placeholder credentials

### To Remove from Git History:

The credentials exist in commit history. To fully remove them, you have two options:

#### Option A: Use BFG Repo-Cleaner (Recommended)
```bash
# Install BFG if not already installed
brew install bfg  # or download from https://rtyley.github.io/bfg-repo-cleaner/

# Remove credentials from history
cd /Users/lisorthman/Desktop/Revamp
bfg --replace-text credentials.txt
# Where credentials.txt contains:
# mongodb+srv://latheeshan888_db_user:nwZdurRR5XLAr7gx@localead.6sfty32.mongodb.net==>mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net
# mongodb+srv://Scholarshare:scholarshare@cluster0.mmj1r.mongodb.net==>mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net

# Force push the cleaned branch
git push origin Admindashboard-new --force
```

#### Option B: Create New Clean Branch
```bash
# Create a new branch from upstream/main (clean history)
git checkout -b Admindashboard-clean upstream/main

# Cherry-pick only the safe commits (after 913bbbf)
git cherry-pick 49df8bd  # Latest safe commit

# Or manually apply changes without the problematic file

# Push new branch
git push origin Admindashboard-clean

# Create new PR from clean branch
```

### Best Practices Going Forward:

- ✅ Never commit credentials to git
- ✅ Use environment variables or secrets management
- ✅ Add credential files to .gitignore
- ✅ Use secret scanning in CI/CD (like GitGuardian)
- ✅ Rotate credentials immediately if exposed

---

**Note**: This file can be deleted after credentials are rotated and history is cleaned.

