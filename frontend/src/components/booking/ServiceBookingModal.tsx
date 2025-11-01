"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
}

interface ServiceBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registeredVehicles: Vehicle[];
}

export default function ServiceBookingModal({
  open,
  onOpenChange,
  registeredVehicles,
}: ServiceBookingModalProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [otherVehicleDetails, setOtherVehicleDetails] = useState({
    make: "",
    model: "",
    year: "",
    registrationNumber: "",
  });
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock time slots - replace with API call
  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  const handleSubmit = async () => {
    setLoading(true);
    
    // Prepare booking data
    const bookingData = {
      vehicleType: selectedVehicle,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      remarks,
      ...(selectedVehicle === "other" && {
        vehicleDetails: otherVehicleDetails,
      }),
    };

    console.log("Booking data:", bookingData);

    // TODO: Replace with actual API call
    setTimeout(() => {
      setLoading(false);
      alert("Booking submitted successfully!");
      onOpenChange(false);
      // Reset form
      setSelectedVehicle("");
      setSelectedDate("");
      setSelectedTimeSlot("");
      setOtherVehicleDetails({ make: "", model: "", year: "", registrationNumber: "" });
      setRemarks("");
    }, 1000);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Book Service</DialogTitle>
          <DialogDescription>
            Select your vehicle, preferred date and time slot for service
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Vehicle Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Vehicle</Label>
            <RadioGroup
              value={selectedVehicle}
              onValueChange={setSelectedVehicle}
            >
              {registeredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={vehicle.id} id={vehicle.id} />
                  <Label
                    htmlFor={vehicle.id}
                    className="cursor-pointer font-normal"
                  >
                    {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.registrationNumber}
                  </Label>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="cursor-pointer font-normal">
                  Other Vehicle
                </Label>
              </div>
            </RadioGroup>

            {/* Other Vehicle Details */}
            {selectedVehicle === "other" && (
              <div className="ml-6 space-y-3 border-l-2 border-[#00F9FF] pl-4 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      placeholder="Toyota"
                      value={otherVehicleDetails.make}
                      onChange={(e) =>
                        setOtherVehicleDetails({
                          ...otherVehicleDetails,
                          make: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="Camry"
                      value={otherVehicleDetails.model}
                      onChange={(e) =>
                        setOtherVehicleDetails({
                          ...otherVehicleDetails,
                          model: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2020"
                      value={otherVehicleDetails.year}
                      onChange={(e) =>
                        setOtherVehicleDetails({
                          ...otherVehicleDetails,
                          year: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg">Registration Number</Label>
                    <Input
                      id="reg"
                      placeholder="ABC-1234"
                      value={otherVehicleDetails.registrationNumber}
                      onChange={(e) =>
                        setOtherVehicleDetails({
                          ...otherVehicleDetails,
                          registrationNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <Label htmlFor="date" className="text-base font-semibold">
              Select Date
            </Label>
            <Input
              id="date"
              type="date"
              min={getMinDate()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Available Time Slots</Label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    variant={
                      selectedTimeSlot === slot ? "default" : "outline"
                    }
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={
                      selectedTimeSlot === slot
                        ? "bg-[#00F9FF] text-[#0A0A0B] hover:bg-[#4CC9F4]"
                        : ""
                    }
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="space-y-3">
            <Label htmlFor="remarks" className="text-base font-semibold">
              Remarks (Optional)
            </Label>
            <Textarea
              id="remarks"
              placeholder="Any specific requirements or issues with your vehicle..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              !selectedVehicle ||
              !selectedDate ||
              !selectedTimeSlot ||
              (selectedVehicle === "other" &&
                (!otherVehicleDetails.make ||
                  !otherVehicleDetails.model ||
                  !otherVehicleDetails.year ||
                  !otherVehicleDetails.registrationNumber)) ||
              loading
            }
            className="bg-[#00F9FF] text-[#0A0A0B] hover:bg-[#4CC9F4]"
          >
            {loading ? "Booking..." : "Book Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

