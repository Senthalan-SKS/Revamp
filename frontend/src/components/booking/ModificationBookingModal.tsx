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
import { Checkbox } from "@/components/ui/checkbox";
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

interface ModificationService {
  id: string;
  name: string;
  estimatedHours: number;
  description?: string;
}

interface ModificationBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registeredVehicles: Vehicle[];
}

// Mock modification services - replace with API call
const modificationServices: ModificationService[] = [
  { id: "1", name: "Engine Change", estimatedHours: 16, description: "Complete engine replacement" },
  { id: "2", name: "Painting", estimatedHours: 12, description: "Full body paint job" },
  { id: "3", name: "Interior Upgrade", estimatedHours: 8, description: "Seats, dashboard, and upholstery" },
  { id: "4", name: "Performance Tuning", estimatedHours: 6, description: "ECU tuning and modifications" },
  { id: "5", name: "Body Kit Installation", estimatedHours: 10, description: "Install custom body kit" },
  { id: "6", name: "Suspension Upgrade", estimatedHours: 8, description: "Full suspension system upgrade" },
  { id: "7", name: "Wheels & Tires", estimatedHours: 2, description: "Install new wheels and tires" },
  { id: "8", name: "Audio System", estimatedHours: 6, description: "Complete audio system installation" },
];

export default function ModificationBookingModal({
  open,
  onOpenChange,
  registeredVehicles,
}: ModificationBookingModalProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [otherVehicleDetails, setOtherVehicleDetails] = useState({
    make: "",
    model: "",
    year: "",
    registrationNumber: "",
  });
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateEstimatedTime = () => {
    if (selectedServices.length === 0) return 0;
    
    // Add extra time for multiple services (logistics, setup time)
    const baseHours = selectedServices.reduce((total, serviceId) => {
      const service = modificationServices.find((s) => s.id === serviceId);
      return total + (service?.estimatedHours || 0);
    }, 0);
    
    // Add buffer time based on number of services
    const bufferMultiplier = 1 + (selectedServices.length - 1) * 0.1;
    return Math.ceil(baseHours * bufferMultiplier);
  };

  const calculateEstimatedCost = () => {
    // Mock calculation - replace with actual pricing logic
    const estimatedHours = calculateEstimatedTime();
    const hourlyRate = 5000; // Mock rate
    return estimatedHours * hourlyRate;
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Prepare booking data
    const bookingData = {
      vehicleType: selectedVehicle,
      date: selectedDate,
      services: selectedServices,
      estimatedTime: calculateEstimatedTime(),
      estimatedCost: calculateEstimatedCost(),
      remarks,
      ...(selectedVehicle === "other" && {
        vehicleDetails: otherVehicleDetails,
      }),
    };

    console.log("Modification Booking data:", bookingData);

    // TODO: Replace with actual API call
    setTimeout(() => {
      setLoading(false);
      alert("Modification booking submitted successfully!");
      onOpenChange(false);
      // Reset form
      setSelectedVehicle("");
      setSelectedDate("");
      setSelectedServices([]);
      setOtherVehicleDetails({ make: "", model: "", year: "", registrationNumber: "" });
      setRemarks("");
    }, 1000);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const selectedServicesData = selectedServices.map((id) =>
    modificationServices.find((s) => s.id === id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Book Modification Project</DialogTitle>
          <DialogDescription>
            Select modifications and book your project
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

          {/* Modification Services Selection */}
          {selectedDate && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Select Modification Services
              </Label>
              <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                {modificationServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Checkbox
                      id={service.id}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={service.id}
                        className="cursor-pointer font-normal flex items-center gap-2"
                      >
                        <span className="font-semibold">{service.name}</span>
                        <span className="text-xs bg-[#3E92CC] text-white px-2 py-1 rounded">
                          ~{service.estimatedHours}h
                        </span>
                      </Label>
                      {service.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Estimated Time and Cost */}
              {selectedServices.length > 0 && (
                <div className="bg-gradient-to-r from-[#00F9FF] to-[#4CC9F4] p-4 rounded-lg">
                  <div className="flex justify-between items-center text-white">
                    <div>
                      <p className="text-sm font-medium">Estimated Time</p>
                      <p className="text-2xl font-bold">
                        {calculateEstimatedTime()} hours
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Estimated Cost</p>
                      <p className="text-2xl font-bold">
                        Rs. {calculateEstimatedCost().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Remarks */}
          <div className="space-y-3">
            <Label htmlFor="remarks" className="text-base font-semibold">
              Additional Remarks (Optional)
            </Label>
            <Textarea
              id="remarks"
              placeholder="Any specific requirements or details about your modification project..."
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
              selectedServices.length === 0 ||
              (selectedVehicle === "other" &&
                (!otherVehicleDetails.make ||
                  !otherVehicleDetails.model ||
                  !otherVehicleDetails.year ||
                  !otherVehicleDetails.registrationNumber)) ||
              loading
            }
            className="bg-[#00F9FF] text-[#0A0A0B] hover:bg-[#4CC9F4]"
          >
            {loading ? "Booking..." : "Book Modification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

