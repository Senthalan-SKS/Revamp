# Booking Time Slot Integration Guide

This guide explains how to integrate the time slot availability system into your existing customer booking form.

## Overview

The time slot system provides:
- **Service bookings**: 3-hour time slots (8-11 AM, 11 AM-2 PM, 2-5 PM) on Monday-Saturday
- **Modification bookings**: Available Monday-Saturday, 8 AM-5 PM (no slot restrictions)
- **Unavailable dates**: Holidays, maintenance, shop closures affect both service types

## API Endpoints

### Check Date Availability
```
GET /api/bookings/timeslots/check-availability/{date}
```
Returns availability info and available slots for a date.

**Response:**
```json
{
  "date": "2024-01-15",
  "isAvailable": true,
  "isUnavailable": false,
  "isSunday": false,
  "availableSlots": [
    {
      "id": "slot-id-1",
      "date": "2024-01-15",
      "startTime": "08:00",
      "endTime": "11:00",
      "isAvailable": true
    }
  ],
  "slotCount": 3,
  "message": null
}
```

### Get Available Slots for Date
```
GET /api/bookings/timeslots/available/{date}
```
Returns only available time slots for a specific date.

## Frontend Components

### 1. TimeSlotSelector Component

A ready-to-use component that displays available time slots:

```tsx
import TimeSlotSelector from "@/components/TimeSlotSelector";

// In your booking form
<TimeSlotSelector
  selectedDate={formData.date}
  serviceType={formData.serviceType}
  onSlotSelect={(slotId, timeSlot) => {
    setFormData({ ...formData, timeSlotId: slotId });
  }}
  disabled={isSubmitting}
/>
```

### 2. Utility Functions

#### Check Date Availability
```typescript
import { checkDateAvailability } from "@/utils/bookingUtils";

const availability = await checkDateAvailability("2024-01-15");
if (!availability.isAvailable) {
  // Show error message
}
```

#### Validate Booking Before Submission
```typescript
import { validateBooking, formatBookingForAPI } from "@/utils/bookingValidation";

// Validate before submitting
const validation = await validateBooking({
  serviceType: "Service",
  date: "2024-01-15",
  timeSlotId: "slot-id-123",
  vehicleId: "vehicle-id",
  customerId: "customer-id"
});

if (!validation.isValid) {
  // Show errors
  console.error(validation.errors);
  return;
}

// Format and submit
const bookingData = formatBookingForAPI({
  customerId: "customer-id",
  customerName: "John Doe",
  vehicleId: "vehicle-id",
  serviceType: "Service",
  date: "2024-01-15",
  timeSlotId: "slot-id-123",
  // ... other fields
});

// Submit to your booking API
await fetch("/api/bookings", {
  method: "POST",
  body: JSON.stringify(bookingData)
});
```

## Integration Example

### Complete Booking Form Integration

```tsx
"use client";

import { useState, useEffect } from "react";
import TimeSlotSelector from "@/components/TimeSlotSelector";
import { validateBooking, formatBookingForAPI } from "@/utils/bookingValidation";

export default function BookingForm() {
  const [formData, setFormData] = useState({
    serviceType: "Service" as "Service" | "Modification",
    date: "",
    timeSlotId: "",
    vehicleId: "",
    neededModifications: [] as string[],
    instructions: "",
  });
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    try {
      // Validate booking
      const validation = await validateBooking({
        serviceType: formData.serviceType,
        date: formData.date,
        timeSlotId: formData.timeSlotId || undefined,
        vehicleId: formData.vehicleId,
        customerId: "current-user-id", // Get from auth
      });

      if (!validation.isValid) {
        setErrors(validation.errors);
        setIsSubmitting(false);
        return;
      }

      // Format and submit
      const bookingData = formatBookingForAPI({
        customerId: "current-user-id",
        customerName: "Customer Name",
        vehicleId: formData.vehicleId,
        serviceType: formData.serviceType,
        date: formData.date,
        timeSlotId: formData.timeSlotId || undefined,
        neededModifications: formData.neededModifications,
        instructions: formData.instructions,
      });

      // Submit to your booking API
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      // Success - redirect or show success message
      alert("Booking created successfully!");
      
    } catch (error: any) {
      setErrors([error.message || "Failed to create booking"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Service Type Selection */}
      <div>
        <label>Service Type</label>
        <select
          value={formData.serviceType}
          onChange={(e) => {
            setFormData({
              ...formData,
              serviceType: e.target.value as "Service" | "Modification",
              timeSlotId: "", // Reset time slot when changing type
            });
          }}
        >
          <option value="Service">Service</option>
          <option value="Modification">Modification</option>
        </select>
      </div>

      {/* Date Selection */}
      <div>
        <label>Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => {
            setFormData({
              ...formData,
              date: e.target.value,
              timeSlotId: "", // Reset time slot when changing date
            });
          }}
          min={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      {/* Time Slot Selector */}
      <TimeSlotSelector
        selectedDate={formData.date}
        serviceType={formData.serviceType}
        onSlotSelect={(slotId, timeSlot) => {
          setFormData({ ...formData, timeSlotId: slotId || "" });
          setSelectedTimeSlot(timeSlot);
        }}
        disabled={isSubmitting}
      />

      {/* Other form fields... */}
      
      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          {errors.map((error, idx) => (
            <p key={idx} className="text-red-700 text-sm">{error}</p>
          ))}
        </div>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Booking"}
      </button>
    </form>
  );
}
```

## Backend Validation

The booking service automatically validates:
- **Service bookings**: Requires valid, available time slot
- **Modification bookings**: Checks date is not unavailable or Sunday
- **Both types**: Unavailable dates are blocked automatically

When creating a booking via the API, the service will:
1. Validate the date is available
2. For Service: Book the time slot (mark as unavailable)
3. For Modification: Set default time (8 AM - 5 PM)
4. Return error if validation fails

## Testing

### Test Scenarios

1. **Service Booking with Available Slot**
   - Select a date (Monday-Saturday)
   - Select "Service" type
   - Should show 3 available slots
   - Select a slot and submit
   - Should succeed

2. **Service Booking on Unavailable Date**
   - Select a date that's marked as unavailable
   - Select "Service" type
   - Should show "Date is unavailable" message
   - Should not allow booking

3. **Modification Booking**
   - Select a date (Monday-Saturday)
   - Select "Modification" type
   - Should show "Date is available" message
   - No time slots shown
   - Should allow booking

4. **Sunday Booking**
   - Select a Sunday
   - Both service types should show "Shop is closed on Sundays"

5. **Slot Already Booked**
   - Try to book a slot that was just booked
   - Should show error or slot should be removed from available list

## Admin Functions

Admins can manage unavailable dates via the admin dashboard:
- Add holidays, maintenance days, shop closures
- These dates automatically block both Service and Modification bookings
- Changes take effect immediately

## Notes

- Time slots are automatically created when first checked
- Booked slots are marked as unavailable
- Unavailable dates affect both service types
- Sunday is automatically blocked for both types
- Shop hours: Monday-Saturday, 8 AM - 5 PM

