import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["PATIENT", "DOCTOR"]),
    // Ensure these are part of the base object so TS sees them
    specialization: z.string().optional(),
    fees: z.number().positive().optional(),
  })
  .superRefine((data, ctx) => {
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

  export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// src/validations/auth.validation.ts

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
  .string()
  // Change {1,14} to {9,14} to require at least 10 digits (including the first digit)
  .regex(/^\+?[1-9]\d{9,14}$/, "Phone number must be at least 10 digits")
  .optional()
  .or(z.literal("")),
  specialization: z.string().min(2, "Specialization is required").optional(),
  // 🟢 Fees are read-only, so we make validation very loose or optional
  fees: z.any().optional(), 
  address: z.string().min(5, "Address is required").optional(),
  bio: z.string().max(500, "Bio is too long").optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
// It extracts the TypeScript type directly from the schema above.
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
