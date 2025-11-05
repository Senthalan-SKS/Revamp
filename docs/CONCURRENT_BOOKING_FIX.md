# Concurrent Booking Fix - November 8th, 2025 Test

## Problem

When two customers try to book the same time slot simultaneously (e.g., November 8th, 2025 at 8 AM), there was a potential race condition where both could succeed.

## Solution

Implemented atomic booking using MongoDB's `findAndModify` operation to ensure only one customer can successfully book a slot.

## Changes Made

### 1. Improved `TimeSlotService.bookSlot()` Method

**Before:** Used simple query-check-update pattern (race condition possible)

**After:** Uses atomic `findAndModify` operation with condition:
```java
// Only updates if slot is still available
Query query = new Query(Criteria.where("id").is(slotId)
    .and("isAvailable").is(true));

TimeSlot slot = mongoTemplate.findAndModify(
    query,
    update,
    FindAndModifyOptions.options().returnNew(true),
    TimeSlot.class
);
```

**How it works:**
- MongoDB atomically finds and modifies the document
- Only succeeds if `isAvailable` is still `true`
- If two requests arrive simultaneously, only one will find the slot available
- The second request will get `null` and receive "Time slot is already booked" error

## Testing the Scenario

### Test Case: November 8th, 2025, 8 AM Slot

**Scenario:**
1. Customer 1 books 8 AM slot on November 8th, 2025
2. Customer 2 tries to book the same slot

**Expected Results:**
- ✅ Customer 1: Booking succeeds
- ✅ Customer 2: Booking fails with "Time slot is already booked"
- ✅ Slot becomes unavailable after first booking
- ✅ Slot is linked to Customer 1's appointment

### Quick Test Commands

1. **Check available slots:**
```bash
curl http://localhost:4000/api/bookings/timeslots/check-availability/2025-11-08
```

2. **Customer 1 books 8 AM slot:**
```bash
curl -X POST http://localhost:4000/api/bookings/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-1",
    "customerName": "John Doe",
    "vehicle": "Toyota Camry",
    "serviceType": "Service",
    "date": "2025-11-08",
    "timeSlotId": "SLOT_ID_FROM_STEP_1",
    "status": "Pending"
  }'
```

3. **Customer 2 tries to book same slot:**
```bash
curl -X POST http://localhost:4000/api/bookings/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-2",
    "customerName": "Jane Smith",
    "vehicle": "Honda Civic",
    "serviceType": "Service",
    "date": "2025-11-08",
    "timeSlotId": "SAME_SLOT_ID",
    "status": "Pending"
  }'
```

**Expected:** Customer 2 gets error response

4. **Verify slot is unavailable:**
```bash
curl http://localhost:4000/api/bookings/timeslots/available/2025-11-08
```

**Expected:** 8 AM slot should not appear in the list

### Automated Test Script

Run the automated test script:
```bash
./test-concurrent-booking.sh
```

This script:
- Checks available slots for November 8th, 2025
- Finds the 8 AM slot
- Customer 1 books the slot
- Verifies slot is unavailable
- Customer 2 tries to book (should fail)
- Verifies final state

## How Atomic Update Prevents Race Conditions

### Race Condition Prevention

**Atomic Operation:**
```
1. MongoDB finds slot with id=X AND isAvailable=true
2. MongoDB atomically updates: isAvailable=false, appointmentId=Y
3. Returns the updated slot
```

**If slot is already booked:**
```
1. MongoDB finds slot with id=X AND isAvailable=true
2. No document matches (isAvailable is already false)
3. Returns null
4. Service throws "Time slot is already booked" error
```

### Concurrent Request Handling

**Request 1 (Customer 1):**
- Finds slot with `isAvailable=true`
- Updates to `isAvailable=false`
- Returns updated slot ✅

**Request 2 (Customer 2) - Arrives simultaneously:**
- Tries to find slot with `isAvailable=true`
- No match found (already false from Request 1)
- Returns null
- Throws "Time slot is already booked" error ✅

## Benefits

1. **Thread-Safe:** Atomic operation prevents race conditions
2. **Consistent:** Only one customer can book a slot
3. **Clear Error Messages:** Second customer gets clear error message
4. **No Data Corruption:** Impossible to have double-booking

## Verification Checklist

- [ ] Customer 1 can successfully book the 8 AM slot
- [ ] Slot becomes unavailable after Customer 1's booking
- [ ] Customer 2 cannot book the same slot
- [ ] Customer 2 gets clear error message
- [ ] Available slots list no longer shows the 8 AM slot
- [ ] Slot status shows `isAvailable: false` and `appointmentId` linked to Customer 1

## Files Modified

1. `services/bookingservice/src/main/java/com/revamp/booking/bookingservice/service/TimeSlotService.java`
   - Updated `bookSlot()` method to use atomic `findAndModify`
   - Added proper error handling for concurrent bookings

## Test Documentation

- `docs/TEST_CONCURRENT_BOOKING.md` - Detailed test scenarios
- `test-concurrent-booking.sh` - Automated test script

