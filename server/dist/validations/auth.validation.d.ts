import { z } from "zod";
export declare const registerSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<["PATIENT", "DOCTOR"]>;
    specialization: z.ZodOptional<z.ZodString>;
    fees: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    role: "DOCTOR" | "PATIENT";
    name: string;
    specialization?: string | undefined;
    fees?: number | undefined;
}, {
    email: string;
    password: string;
    role: "DOCTOR" | "PATIENT";
    name: string;
    specialization?: string | undefined;
    fees?: number | undefined;
}>, {
    email: string;
    password: string;
    role: "DOCTOR" | "PATIENT";
    name: string;
    specialization?: string | undefined;
    fees?: number | undefined;
}, {
    email: string;
    password: string;
    role: "DOCTOR" | "PATIENT";
    name: string;
    specialization?: string | undefined;
    fees?: number | undefined;
}>;
//# sourceMappingURL=auth.validation.d.ts.map