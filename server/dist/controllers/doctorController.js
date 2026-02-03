"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctorById = exports.getAllDoctors = void 0;
const doctor_service_1 = require("../services/doctor.service");
// GET /api/doctors
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await doctor_service_1.doctorService.fetchAllDoctors();
        res.status(200).json(doctors);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch doctors" });
    }
};
exports.getAllDoctors = getAllDoctors;
// GET /api/doctors/:id
const getDoctorById = async (req, res) => {
    try {
        const id = req.params.id;
        ;
        const doctor = await doctor_service_1.doctorService.fetchDoctorById(id);
        res.status(200).json(doctor);
    }
    catch (error) {
        if (error.message === "Doctor not found") {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Error fetching doctor details" });
        }
    }
};
exports.getDoctorById = getDoctorById;
//# sourceMappingURL=doctorController.js.map