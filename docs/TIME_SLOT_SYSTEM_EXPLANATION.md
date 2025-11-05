# Time Slot System - How It Works

## Overview

The time slot system manages booking availability for **Service** type appointments. It creates and manages 3-hour time slots (8-11 AM, 11 AM-2 PM, 2-5 PM) for Monday-Saturday, preventing double bookings and handling shop closures.

---

## 🏗️ System Architecture

### 1. **Time Slot Structure**

Each time slot is stored in MongoDB with the following structure:

```java
{
  id: "unique-slot-id",
  date: "2025-11-10",           // LocalDate
  startTime: "08:00:00",        // LocalTime (8 AM)
  endTime: "11:00:00",          // LocalTime (11 AM)
  isAvailable: true,            // Boolean - true if not booked
  appointmentId: null           // String - null if available, appointment ID if booked
}
```

### 2. **Time Slot Constants**

The system defines three fixed time slots per day:

```java
SLOT_1: 08:00 - 11:00 (3 hours)
SLOT_2: 11:00 - 14:00 (3 hours)
SLOT_3: 14:00 - 17:00 (3 hours)
```

**Shop Hours**: Monday to Saturday, 8 AM - 5 PM
**Closed**: Sundays and dates marked as "unavailable"

---

## 🔄 Core Functions

### **1. Get Available Slots for a Date**

**Function**: `getAvailableSlotsForDate(LocalDate date)`

**How it works**:
1. ✅ **Check if date is unavailable** (holiday/maintenance)
   - If unavailable → return empty list
2. ✅ **Check if it's Sunday**
   - If Sunday → return empty list
3. ✅ **Get or create slots** for the date
   - Calls `getOrCreateSlot()` for each of the 3 time slots
   - Only returns slots where `isAvailable = true`

**Example Flow**:
```
Date: Nov 10, 2025 (Monday)
↓
Check unavailable dates → ✅ Not unavailable
Check if Sunday → ✅ Not Sunday
↓
Get/Create 3 slots:
  - Slot 1: 08:00-11:00 (available)
  - Slot 2: 11:00-14:00 (available)
  - Slot 3: 14:00-17:00 (available)
↓
Return all 3 slots
```

**If a slot is booked**:
```
Date: Nov 10, 2025
↓
Get/Create 3 slots:
  - Slot 1: 08:00-11:00 (isAvailable: true) ✅
  - Slot 2: 11:00-14:00 (isAvailable: false) ❌ BOOKED
  - Slot 3: 14:00-17:00 (isAvailable: true) ✅
↓
Return only Slot 1 and Slot 3
```

---

### **2. Get or Create Slot**

**Function**: `getOrCreateSlot(LocalDate date, LocalTime startTime, LocalTime endTime)`

**How it works**:
1. 🔍 **Search database** for existing slot with matching date, startTime, and endTime
2. ✅ **If found** → return existing slot
3. ➕ **If not found** → create new slot with:
   - `isAvailable = true`
   - `appointmentId = null`
   - Save to database

**Purpose**: Ensures slots exist in the database **on-demand** (lazy creation). Slots are created when first requested, not pre-generated.

**Example**:
```
Request: Nov 10, 08:00-11:00
↓
Database search: No slot found
↓
Create new slot:
  {
    date: "2025-11-10",
    startTime: "08:00:00",
    endTime: "11:00:00",
    isAvailable: true,
    appointmentId: null
  }
↓
Save to database
↓
Return slot
```

---

### **3. Book a Time Slot (ATOMIC OPERATION)**

**Function**: `bookSlot(String slotId, String appointmentId)`

**How it works**:
1. 🔒 **Atomic Update**: Uses MongoDB's `findAndModify` operation
   - **Query**: Find slot with `id = slotId` AND `isAvailable = true`
   - **Update**: Set `isAvailable = false` and `appointmentId = appointmentId`
   - **Condition**: Only updates if slot is still available

2. ✅ **Success**: If update succeeds → slot is booked
3. ❌ **Failure**: If update returns `null`:
   - Check if slot exists
   - If exists but `isAvailable = false` → throw "Time slot is already booked"
   - If doesn't exist → throw "Time slot not found"

**Why Atomic?**
- Prevents **race conditions** when multiple customers try to book the same slot simultaneously
- Only **one booking succeeds**, others get an error

**Example - Concurrent Booking**:
```
Customer A and Customer B both try to book Slot ID "abc123" at the same time:

Customer A Request:
  Query: { id: "abc123", isAvailable: true }
  Update: { isAvailable: false, appointmentId: "appt-1" }
  ↓
  MongoDB: ✅ Update succeeds → Slot is booked

Customer B Request (arrives 0.1 seconds later):
  Query: { id: "abc123", isAvailable: true }
  Update: { isAvailable: false, appointmentId: "appt-2" }
  ↓
  MongoDB: ❌ No document matches (isAvailable is now false)
  ↓
  Returns null → System throws "Time slot is already booked"
```

---

### **4. Release a Time Slot**

**Function**: `releaseSlot(String slotId)`

**How it works**:
1. 🔍 Find slot by ID
2. ✅ If found:
   - Set `isAvailable = true`
   - Set `appointmentId = null`
   - Save to database

**When is it called?**
- When an appointment is **cancelled**
- When an appointment is **deleted**

---

### **5. Generate Time Slots for Date Range**

**Function**: `generateTimeSlots(LocalDate startDate, LocalDate endDate)`

**How it works**:
1. Loop through each date from `startDate` to `endDate`
2. For each date:
   - ✅ Skip if Sunday
   - ✅ Skip if date is unavailable
   - ➕ Create 3 slots (8-11, 11-14, 14-17)
3. Return list of all created slots

**Purpose**: Pre-generate slots for a date range (useful for bulk operations or initialization).

---

## 📋 Booking Flow

### **Service Type Appointment**

```
1. Customer selects date: Nov 10, 2025
   ↓
2. Frontend calls: GET /api/bookings/timeslots/check-availability/2025-11-10
   ↓
3. Backend:
   - Checks if date is unavailable → ❌ Not unavailable
   - Checks if Sunday → ❌ Not Sunday
   - Gets available slots:
     * Slot 1: 08:00-11:00 (available)
     * Slot 2: 11:00-14:00 (available)
     * Slot 3: 14:00-17:00 (available)
   ↓
4. Frontend displays 3 available slots
   ↓
5. Customer selects: Slot 3 (14:00-17:00)
   ↓
6. Frontend calls: POST /api/bookings/appointments
   Body: {
     serviceType: "Service",
     date: "2025-11-10",
     timeSlotId: "slot-3-id",
     ...
   }
   ↓
7. Backend (BookingService.createAppointment):
   - Validates timeSlotId is provided
   - Calls TimeSlotService.bookSlot(slotId, null)
     ↓
     Atomic update:
       Query: { id: "slot-3-id", isAvailable: true }
       Update: { isAvailable: false, appointmentId: null }
       ✅ Success → Slot is booked
   - Sets appointment time from slot (14:00)
   - Sets appointment endTime from slot (17:00)
   - Saves appointment to database
   - Updates slot with appointment ID
   ↓
8. Appointment created successfully
   ↓
9. If another customer tries to book the same slot:
   - Atomic update fails (slot is no longer available)
   - Returns error: "Time slot is already booked"
```

### **Modification Type Appointment**

```
1. Customer selects date: Nov 10, 2025
   ↓
2. Frontend calls: GET /api/bookings/timeslots/check-availability/2025-11-10
   ↓
3. Backend:
   - Checks if date is unavailable → ❌ Not unavailable
   - Checks if Sunday → ❌ Not Sunday
   - Returns: { isAvailable: true, message: "Available for modification" }
   ↓
4. Frontend shows: "✓ This date is available for modification booking"
   ↓
5. Customer submits booking
   ↓
6. Backend (BookingService.createAppointment):
   - Validates date is not unavailable
   - Validates date is not Sunday
   - Sets default time: 08:00 (8 AM)
   - Sets endTime: 17:00 (5 PM)
   - Saves appointment (NO time slot booking)
   ↓
7. Appointment created successfully
```

---

## 🔐 Unavailable Dates

### **How Unavailable Dates Affect Time Slots**

1. **When checking availability**:
   - `getAvailableSlotsForDate()` returns empty list if date is unavailable

2. **When generating slots**:
   - `generateTimeSlots()` skips unavailable dates

3. **For both Service and Modification**:
   - Unavailable dates block **all bookings** for that date

**Example**:
```
Admin adds unavailable date: Nov 15, 2025 (Holiday)
↓
Customer tries to book Nov 15:
  - Service type: No slots available
  - Modification type: Date unavailable error
```

---

## 🎨 Frontend Integration

### **TimeSlotSelector Component**

**Location**: `frontend/src/components/TimeSlotSelector.tsx`

**How it works**:

1. **Receives props**:
   - `selectedDate`: Date string (e.g., "2025-11-10")
   - `serviceType`: "Service" or "Modification"
   - `onSlotSelect`: Callback when slot is selected

2. **For Service type**:
   - Calls `checkDateAvailability(selectedDate)`
   - Displays available time slots as clickable buttons
   - When slot is clicked → calls `onSlotSelect(slotId, slot)`

3. **For Modification type**:
   - Calls `checkDateAvailability(selectedDate)`
   - Shows availability message (no slot selection needed)

4. **States**:
   - `loading`: Shows "Loading..." while checking availability
   - `availability`: Stores availability data from API
   - `selectedSlotId`: Tracks which slot is selected

---

## 📊 API Endpoints

### **1. Check Date Availability**
```
GET /api/bookings/timeslots/check-availability/{date}

Response:
{
  "date": "2025-11-10",
  "isAvailable": true,
  "isUnavailable": false,
  "isSunday": false,
  "availableSlots": [
    {
      "id": "slot-1-id",
      "date": "2025-11-10",
      "startTime": "08:00:00",
      "endTime": "11:00:00",
      "isAvailable": true,
      "appointmentId": null
    },
    ...
  ],
  "slotCount": 3
}
```

### **2. Get Available Slots**
```
GET /api/bookings/timeslots/available/{date}

Response: Array of TimeSlot objects (only available ones)
```

### **3. Book Appointment**
```
POST /api/bookings/appointments

Body (Service type):
{
  "serviceType": "Service",
  "date": "2025-11-10",
  "timeSlotId": "slot-3-id",
  "customerName": "John Doe",
  ...
}

Response: Created Appointment object
```

---

## 🛡️ Race Condition Prevention

### **The Problem**
If two customers try to book the same slot at the same time, without atomic operations, both could succeed.

### **The Solution**
Using MongoDB's `findAndModify` with a condition:

```java
Query query = new Query(
  Criteria.where("id").is(slotId)
    .and("isAvailable").is(true)  // ← Only matches if still available
);

Update update = new Update()
  .set("isAvailable", false)
  .set("appointmentId", appointmentId);

TimeSlot slot = mongoTemplate.findAndModify(
  query,
  update,
  FindAndModifyOptions.options().returnNew(true),
  TimeSlot.class
);
```

**How it prevents race conditions**:
1. Query **only matches** if slot is available
2. Update happens **atomically** (single database operation)
3. If two requests arrive simultaneously:
   - First request: Query matches → Update succeeds
   - Second request: Query doesn't match (isAvailable is now false) → Returns null
4. System throws error for second request: "Time slot is already booked"

---

## 📝 Summary

### **Key Features**:
1. ✅ **Lazy Slot Creation**: Slots are created on-demand when first requested
2. ✅ **Atomic Booking**: Prevents double bookings with atomic database operations
3. ✅ **Unavailable Date Handling**: Blocks bookings on holidays/maintenance days
4. ✅ **Sunday Exclusion**: Automatically excludes Sundays
5. ✅ **Service vs Modification**: Different booking logic for each service type
6. ✅ **Slot Release**: Automatically releases slots when appointments are cancelled

### **Database Collections**:
- `timeslots`: Stores time slot availability
- `unavailabledates`: Stores shop closure dates
- `appointments`: Stores customer bookings

### **Flow Summary**:
```
Customer selects date
  ↓
Check availability (unavailable dates, Sundays)
  ↓
Get available slots (filter by isAvailable = true)
  ↓
Customer selects slot
  ↓
Book slot atomically (prevents race conditions)
  ↓
Create appointment
  ↓
Update slot with appointment ID
```

---

## 🔍 Testing Scenarios

### **Scenario 1: Normal Booking**
```
1. Customer A books Nov 10, 2-5 PM slot
2. Slot is booked successfully
3. Customer B tries to book same slot
4. System returns: "Time slot is already booked"
```

### **Scenario 2: Concurrent Booking**
```
1. Customer A and B both try to book same slot simultaneously
2. Customer A's request arrives first → Atomic update succeeds
3. Customer B's request arrives 0.1s later → Atomic update fails
4. Customer B gets error: "Time slot is already booked"
```

### **Scenario 3: Unavailable Date**
```
1. Admin marks Nov 15 as unavailable (Holiday)
2. Customer tries to book Nov 15
3. System returns: "This date is unavailable (holiday/maintenance)"
4. No slots are shown
```

### **Scenario 4: Sunday**
```
1. Customer tries to book Sunday (Nov 16, 2025)
2. System returns: "Shop is closed on Sundays"
3. No slots are shown
```

---

This system ensures **reliable, conflict-free booking** with proper handling of edge cases and concurrent requests.

