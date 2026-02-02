"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    role: zod_1.z.enum(["PATIENT", "DOCTOR"]),
    specialization: zod_1.z.string().optional(),
    fees: zod_1.z.number().positive().optional(),
})
    .superRefine((data, ctx) => {
    // Role validation message
    if (!data.role) {
        ctx.addIssue({
            path: ["role"],
            message: "Role must be either PATIENT or DOCTOR",
            code: zod_1.z.ZodIssueCode.custom,
        });
    }
    // Doctor-specific validation
    if (data.role === "DOCTOR") {
        if (!data.specialization) {
            ctx.addIssue({
                path: ["specialization"],
                message: "Specialization is required for doctors",
                code: zod_1.z.ZodIssueCode.custom,
            });
        }
        if (data.fees === undefined) {
            ctx.addIssue({
                path: ["fees"],
                message: "Fees are required for doctors",
                code: zod_1.z.ZodIssueCode.custom,
            });
        }
    }
});
//# sourceMappingURL=auth.validation.js.map