"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const availabilityController_1 = require("../controllers/availabilityController");
// import { protect } from "../middleware/authMiddleware"; // Add your auth later
const routes_1 = require("../config/routes");
const router = (0, express_1.Router)();
// Endpoint for patients to check slots
router.get(routes_1.AVAILABILITY_ROUTES.GET_SLOTS, availabilityController_1.getAvailableSlots);
// Endpoint for doctors to update their working hours
router.post(routes_1.AVAILABILITY_ROUTES.SET_SCHEDULE, availabilityController_1.setDoctorSchedule);
exports.default = router;
//# sourceMappingURL=availabilityRoutes.js.map