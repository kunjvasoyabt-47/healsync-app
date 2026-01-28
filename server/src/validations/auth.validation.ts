import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),

    email: z.string().email("Invalid email format"),

    password: z.string().min(6, "Password must be at least 6 characters"),

    role: z.enum(["PATIENT", "DOCTOR"]),

    specialization: z.string().optional(),
    fees: z.number().positive().optional(),
  })
  .superRefine((data, ctx) => {
    // Role validation message
    if (!data.role) {
      ctx.addIssue({
        path: ["role"],
        message: "Role must be either PATIENT or DOCTOR",
        code: z.ZodIssueCode.custom,
      });
    }

    // Doctor-specific validation
    if (data.role === "DOCTOR") {
      if (!data.specialization) {
        ctx.addIssue({
          path: ["specialization"],
          message: "Specialization is required for doctors",
          code: z.ZodIssueCode.custom,
        });
      }

      if (data.fees === undefined) {
        ctx.addIssue({
          path: ["fees"],
          message: "Fees are required for doctors",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
