"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyProfile = exports.getMyProfile = void 0;
const patient_service_1 = require("../services/patient.service");
// GET /api/patients/me
const getMyProfile = async (req, res) => {
    try {
        // req.user is populated by verifyToken middleware
        const userId = req.user.userId;
        const patient = await patient_service_1.patientService.fetchProfile(userId);
        res.status(200).json(patient);
    }
    catch (error) {
        if (error.message === "Profile not found") {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Failed to fetch profile" });
        }
    }
};
exports.getMyProfile = getMyProfile;
// PUT /api/patients/me
const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updatedPatient = await patient_service_1.patientService.updateProfile(userId, req.body);
        res.status(200).json({
            message: "Profile updated successfully",
            patient: updatedPatient
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update profile" });
    }
};
exports.updateMyProfile = updateMyProfile;
//# sourceMappingURL=patientController.js.map