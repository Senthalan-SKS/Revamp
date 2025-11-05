# Database Verification Guide

## Database Information

**Database Name:** `Time-slot` (with hyphen)
**Connection String:** `mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/Time-slot?retryWrites=true&w=majority`

## Collections in "Time-slot" Database

The booking service creates and uses these collections:

1. **`timeslots`** - Time slot records
   - Fields: `id`, `date`, `startTime`, `endTime`, `isAvailable`, `appointmentId`

2. **`appointments`** - Booking/appointment records
   - Fields: `id`, `customerId`, `customerName`, `vehicle`, `serviceType`, `date`, `time`, `timeSlotId`, `status`, etc.

3. **`unavailabledates`** - Unavailable dates (holidays/maintenance)
   - Fields: `id`, `date`, `reason`, `description`

## How to Verify Data in MongoDB Atlas

### Step 1: Access MongoDB Atlas
1. Go to https://cloud.mongodb.com/
2. Login with your credentials
3. Select your cluster: `cluster.mongodb.net`

### Step 2: Browse Collections
1. Click on "Browse Collections" button
2. In the database dropdown, select: **`Time-slot`** (with hyphen, not "Time_slot" or "Timeslot")
3. You should see three collections:
   - `timeslots`
   - `appointments`
   - `unavailabledates`

### Step 3: View Data
Click on each collection to view documents:

**`timeslots` collection:**
- Should contain time slots for dates that have been checked
- Example: `{id: "...", date: "2025-11-08", startTime: "08:00", endTime: "11:00", isAvailable: false, appointmentId: "..."}`

**`appointments` collection:**
- Should contain booking records
- Example: `{id: "...", customerId: "customer-1", customerName: "John Doe", vehicle: "Toyota Camry", serviceType: "Service", date: "2025-11-08", timeSlotId: "...", status: "Pending"}`

**`unavailabledates` collection:**
- Should contain holidays/maintenance dates (if any added via admin dashboard)

## Verify Data via API

### Check Time Slots
```bash
curl http://localhost:8084/api/bookings/timeslots/range?startDate=2025-11-08&endDate=2025-11-08
```

### Check Appointments
```bash
curl http://localhost:8084/api/bookings/appointments
```

### Check Unavailable Dates
```bash
curl http://localhost:8084/api/bookings/unavailable-dates
```

## Run Verification Script

```bash
cd services/bookingservice
./verify-database.sh
```

This script will:
- Check if booking service is running
- Verify database connection
- Count documents in each collection
- Display sample data

## Troubleshooting

### Issue: No data visible in MongoDB Atlas

**Possible causes:**
1. **Wrong database name** - Make sure you're looking at `Time-slot` (with hyphen), not `Time_slot` or `Timeslot`
2. **Wrong cluster** - Verify you're connected to your MongoDB cluster
3. **Collections not created yet** - Collections are created when first document is saved
4. **Refresh needed** - Refresh MongoDB Atlas browser

**Solution:**
1. Check the database name in MongoDB Atlas (should be `Time-slot`)
2. If database doesn't exist, create a booking via API - it will create the database automatically
3. Refresh the MongoDB Atlas browser

### Issue: Data not persisting

**Check:**
1. Verify booking service is running: `lsof -i :8084`
2. Check booking service logs for errors
3. Verify MongoDB connection string is correct
4. Test API endpoints to see if data is returned

**Solution:**
- Data should persist automatically when using `mongoTemplate.save()`
- Check if there are any errors in the booking service console logs
- Verify MongoDB connection credentials are correct

## Expected Data After Booking

After creating a booking for November 8th, 2025 at 8 AM:

**`timeslots` collection:**
- 3 documents for November 8th, 2025
- One slot (8 AM) with `isAvailable: false` and `appointmentId` set
- Two slots (11 AM, 2 PM) with `isAvailable: true` and `appointmentId: null`

**`appointments` collection:**
- 1 document with:
  - `customerName: "John Doe"`
  - `vehicle: "Toyota Camry"`
  - `date: "2025-11-08"`
  - `timeSlotId: "..."` (the 8 AM slot ID)
  - `status: "Pending"`

## Database Connection Details

**Current Configuration:**
- Database: `Time-slot`
- Cluster: Your MongoDB Atlas cluster
- Collections: `timeslots`, `appointments`, `unavailabledates`

**Note:** MongoDB collection names are case-sensitive. Make sure you're looking at the exact collection names as defined in the `@Document` annotations.

