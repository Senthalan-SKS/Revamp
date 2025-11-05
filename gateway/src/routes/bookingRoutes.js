const express = require("express");
const router = express.Router();

const BOOKING_SERVICE = process.env.BOOKING_SERVICE_URL || "http://localhost:8084";

// Forward all booking routes to booking service
router.use("/bookings", async (req, res) => {
	try {
		// req.path is like /timeslots/... after /bookings is matched
		// We need to reconstruct: /api/bookings/timeslots/...
		const url = `${BOOKING_SERVICE}/api/bookings${req.path}`;
		console.log(`[Gateway] Forwarding ${req.method} ${url}`);

		const response = await fetch(url, {
			method: req.method,
			headers: {
				"Content-Type": "application/json",
				...req.headers,
			},
			body: req.method !== "GET" && req.method !== "DELETE" 
				? JSON.stringify(req.body) 
				: undefined,
		});

		const data = await response.json().catch(() => ({}));
		res.status(response.status).json(data);
	} catch (error) {
		console.error("[Gateway] Booking service error:", error);
		res.status(500).json({ message: "Gateway error: " + error.message });
	}
});

module.exports = router;

