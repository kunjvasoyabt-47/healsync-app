import { Request, Response } from "express";
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const logout: (req: Request, res: Response) => Promise<void>;
/**
 * NEW: Handles the forgot password request
 */
export declare const forgotPassword: (req: Request, res: Response) => Promise<void>;
/**
 * NEW: Handles the actual password update
 */
export declare const resetPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=authController.d.ts.map