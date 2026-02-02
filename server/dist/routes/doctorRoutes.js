"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctorController_1 = require("../controllers/doctorController");
const routes_1 = require("../config/routes");
const router = express_1.default.Router();
// Public doctor routes
router.get(routes_1.DOCTOR_ROUTES.GET_ALL, doctorController_1.getAllDoctors);
router.get(routes_1.DOCTOR_ROUTES.GET_BY_ID, doctorController_1.getDoctorById);
exports.default = router;
//# sourceMappingURL=doctorRoutes.js.map