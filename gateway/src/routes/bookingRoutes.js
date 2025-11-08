const express = require("express");
const router = express.Router();

// Node.js 18+ has built-in fetch, otherwise use node-fetch
const fetch = globalThis.fetch || require("node-fetch");

const BOOKING_SERVICE = process.env.BOOKING_SERVICE_URL || "http://localhost:8084";

// Forward all booking routes to booking service
router.use("/bookings", async (req, res) => {
	try {
		// req.path will be like /appointments or /{id} or /appointments/... after /bookings is matched
		// We need to forward to /api/bookings/appointments or /api/bookings/{id} or /api/bookings/appointments/...
		let targetPath = req.path || "";
		// Remove leading slash if present
		if (targetPath.startsWith("/")) {
			targetPath = targetPath.substring(1);
		}
		// Construct the full URL
		const url = targetPath 
			? `${BOOKING_SERVICE}/api/bookings/${targetPath}`
			: `${BOOKING_SERVICE}/api/bookings`;
		console.log(`[Gateway] Forwarding ${req.method} ${req.originalUrl} -> ${url}`);
		console.log(`[Gateway] Request body:`, JSON.stringify(req.body));

		const fetchOptions = {
			method: req.method,
			headers: {
				"Content-Type": "application/json",
			},
		};

		// Forward Authorization header if present
		if (req.headers["authorization"]) {
			fetchOptions.headers["Authorization"] = req.headers["authorization"];
		}

		// Only add body for methods that support it
		if (req.method !== "GET" && req.method !== "DELETE" && req.body) {
			fetchOptions.body = JSON.stringify(req.body);
		}

		let response;
		try {
			response = await fetch(url, fetchOptions);
		} catch (fetchError) {
			console.error("[Gateway] Fetch error:", fetchError);
			console.error("[Gateway] Fetch error details:", {
				name: fetchError.name,
				message: fetchError.message,
				code: fetchError.code,
				cause: fetchError.cause
			});
			throw fetchError;
		}

		if (!response.ok) {
			console.error(`[Gateway] Booking service returned error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json().catch(() => {
			console.error("[Gateway] Failed to parse response as JSON");
			return { error: "Invalid response from booking service" };
		});
		
		res.status(response.status).json(data);
	} catch (error) {
		console.error("[Gateway] Booking service error:", error);
		console.error("[Gateway] Error stack:", error.stack);
		
		// Provide more specific error messages
		let statusCode = 500;
		let errorMessage = "Internal server error";
		
		if (error.code === 'ECONNREFUSED') {
			statusCode = 503; // Service Unavailable
			errorMessage = "Booking service is currently unavailable. Please ensure the booking service is running on port 8084.";
			console.error(`[Gateway] Connection refused to booking service at ${BOOKING_SERVICE}. Is the service running?`);
		} else if (error.name === 'AbortError' || error.name === 'TimeoutError') {
			statusCode = 504; // Gateway Timeout
			errorMessage = "Booking service request timed out. The service may be overloaded or not responding.";
		} else if (error.message) {
			errorMessage = error.message;
		}
		
		res.status(statusCode).json({ 
			message: errorMessage,
			error: "BookingServiceUnavailable",
			service: "booking-service",
			serviceUrl: BOOKING_SERVICE
		});
	}
});

module.exports = router;

