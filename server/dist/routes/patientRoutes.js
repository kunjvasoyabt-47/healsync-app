"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const patientController_1 = require("../controllers/patientController");
const authMiddleware_1 = require("../middle/authMiddleware");
const routes_1 = require("../config/routes");
const router = express_1.default.Router();
// Protected patient routes
router.get(routes_1.PATIENT_ROUTES.ME, authMiddleware_1.verifyToken, patientController_1.getMyProfile);
router.put(routes_1.PATIENT_ROUTES.ME, authMiddleware_1.verifyToken, patientController_1.updateMyProfile);
exports.default = router;
//# sourceMappingURL=patientRoutes.js.map