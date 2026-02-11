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
export declare const getMe: (req: Request, res: Response) => Promise<void>;
/**
 * Controller to handle automatic token rotation
 */
export declare const refresh: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authController.d.ts.map