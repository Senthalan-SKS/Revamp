"use client";

import { useEffect, useState } from "react";
import { getGreeting } from "../../utils/greeting";
import { decodeToken, TokenPayload } from "../../utils/jwt";
import Link from "next/link";
import ServiceBookingModal from "@/components/booking/ServiceBookingModal";
import ModificationBookingModal from "@/components/booking/ModificationBookingModal";
import { Button } from "@/components/ui/button";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
}

export default function ConsumerDashboard() {
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [modificationModalOpen, setModificationModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      setUser(decoded);
    }
  }, []);

  const greeting = getGreeting();

  // Mock vehicle data - replace with API call
  const registeredVehicles: Vehicle[] = [
    {
      id: "1",
      make: "Toyota",
      model: "Camry",
      year: 2020,
      registrationNumber: "ABC-1234",
    },
    {
      id: "2",
      make: "Honda",
      model: "Civic",
      year: 2022,
      registrationNumber: "XYZ-5678",
    },
  ];

  // for music 
 const [isPlaying, setIsPlaying] = useState(false); 
 const toggleMusic = () => {
    const audio = document.getElementById("bg-audio") as HTMLAudioElement;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };
// for music 




  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 relative">
      {/* Back to Home button in top-right */}
      <div className="absolute top-4 right-4 z-10">
        <Link href="/">
          <button className="px-3 py-2 text-sm rounded-lg bg-[#0A0A0B] text-white hover:bg-gray-900 transition">
            Back to Home
          </button>
        </Link>
      </div>

      <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#00F9FF] to-[#4CC9F4] bg-clip-text text-transparent">
            {greeting}, {user?.username || "Consumer"}!
          </h1>
          <p className="text-gray-600">Role: {user?.role || "CONSUMER"}</p>
          <p className="text-gray-600">Email: {user?.email || "consumer@revamp.com"}</p>
        </div>

        {/* Booking Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
          <Button
            onClick={() => setServiceModalOpen(true)}
            className="bg-gradient-to-r from-[#00F9FF] to-[#4CC9F4] text-[#0A0A0B] hover:from-[#4CC9F4] hover:to-[#3E92CC] h-24 text-lg font-semibold shadow-lg"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">🔧</div>
              <div>Book Service</div>
            </div>
          </Button>

          <Button
            onClick={() => setModificationModalOpen(true)}
            className="bg-gradient-to-r from-[#3E92CC] to-[#4CC9F4] text-white hover:from-[#4CC9F4] hover:to-[#00F9FF] h-24 text-lg font-semibold shadow-lg"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">🚗</div>
              <div>Book Modification</div>
            </div>
          </Button>
        </div>

        {/* Quick Info */}
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-gray-800 mb-2">Quick Info</h3>
          <p className="text-sm text-gray-600">
            Click the buttons above to book a service or modification project. You can track your
            bookings and view history from the sidebar.
          </p>
        </div>

        {/* Music Player */}
        <div className="mt-6 text-center">
          <button
            onClick={toggleMusic}
            className="px-4 py-2 rounded-lg bg-[#3DDC97] text-white hover:bg-green-600 transition"
          >
            {isPlaying ? "⏸ Pause Music" : "🎵 Play Music"}
          </button>
          <audio id="bg-audio" src="/music/theme4.mp3" loop />
        </div>
      </div>

      {/* Modals */}
      <ServiceBookingModal
        open={serviceModalOpen}
        onOpenChange={setServiceModalOpen}
        registeredVehicles={registeredVehicles}
      />
      <ModificationBookingModal
        open={modificationModalOpen}
        onOpenChange={setModificationModalOpen}
        registeredVehicles={registeredVehicles}
      />
    </main>
  );
}
