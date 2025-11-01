# MongoDB EAD-Employes Database Verification

## Connection Details
- **Connection String**: `mongodb+srv://Scholarshare:scholarshare@cluster0.mmj1r.mongodb.net/EAD-Employes?retryWrites=true&w=majority`
- **Database Name**: `EAD-Employes`
- **Collection Name**: `Details`
- **Cluster**: `cluster0.mmj1r`

## How to Verify in MongoDB Atlas

1. **Login to MongoDB Atlas**: https://cloud.mongodb.com
2. **Select the correct cluster**: `cluster0.mmj1r.mongodb.net`
3. **Click "Browse Collections"**
4. **Look for Database**: `EAD-Employes`
5. **Look for Collection**: `Details`

## Current Test Data

The following employee details should be visible:

1. **Test Employee**
   - Full Name: Test Employee
   - Email: testemp@test.com
   - Phone: 1234567890
   - Skills: Engine, Electronics

2. **Another Test Employee**
   - Full Name: Another Test Employee
   - Email: anothertest@test.com
   - Phone: 9876543210
   - Skills: Brake, AC

## Verification Steps

1. Check MongoDB Atlas Dashboard
2. Ensure you're connected to the correct cluster: `cluster0.mmj1r`
3. Navigate to Database: `EAD-Employes`
4. Navigate to Collection: `Details`
5. You should see documents with fields:
   - `_id` (ObjectId)
   - `userId` (String)
   - `fullName` (String)
   - `email` (String)
   - `phoneNumber` (String)
   - `skills` (Array of Strings)

## If Data is Not Visible

1. **Check Cluster**: Make sure you're looking at `cluster0.mmj1r.mongodb.net`
2. **Check Database**: Database name is `EAD-Employes` (exact spelling, case-sensitive)
3. **Check Collection**: Collection name is `Details` (exact spelling, case-sensitive)
4. **Refresh**: Try refreshing MongoDB Atlas browser
5. **Check Permissions**: Ensure user `Scholarshare` has read/write permissions
6. **Check Network Access**: Ensure your IP is whitelisted in MongoDB Atlas

## Testing via API

You can verify data is being saved by calling:
```bash
curl http://localhost:4000/api/auth/employee-details
```

This should return all employee details saved to the EAD-Employes database.

