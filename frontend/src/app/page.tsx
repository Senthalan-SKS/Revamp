"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen px-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-center">
      {/* Hero Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent"
      >
        Revamp Vehicle Service Booking
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl"
      >
        Hassle-free vehicle servicing at your fingertips. Book, manage, and
        track your appointments with ease.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-8 flex gap-4"
      >
        <Link href="/login">
          <button className="px-6 py-3 text-lg rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
            Login
          </button>
        </Link>
        <Link href="/register">
          <button className="px-6 py-3 text-lg rounded-xl bg-gray-800 text-white hover:bg-gray-900 transition">
            Register
          </button>
        </Link>
      </motion.div>
    </main>
  );
}
