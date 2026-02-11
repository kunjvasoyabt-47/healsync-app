"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const availabilityController_1 = require("../controllers/availabilityController");
const authMiddleware_1 = require("../middle/authMiddleware");
const router = (0, express_1.Router)();
// Matches: POST /api/availability/dc9a.../set-schedule
router.post("/:doctorId/set-schedule", authMiddleware_1.verifyToken, availabilityController_1.setDoctorSchedule);
// Matches: GET /api/availability/dc9a.../slots
router.get("/:doctorId/slots", availabilityController_1.getAvailableSlots);
exports.default = router;
//# sourceMappingURL=availabilityRoutes.js.map