import { Request, Response } from "express";
export declare const getAllDoctors: (req: Request, res: Response) => Promise<void>;
export declare const getDoctorById: (req: Request, res: Response) => Promise<void>;
export declare const getMyAppointments: (req: any, res: any) => Promise<any>;
export declare const updateStatus: (req: any, res: any) => Promise<any>;
export declare const getAnalytics: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=doctorController.d.ts.map