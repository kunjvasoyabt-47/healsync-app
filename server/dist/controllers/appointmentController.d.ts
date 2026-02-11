import { Request, Response } from "express";
interface AuthenticatedRequest extends Request {
    file?: Express.Multer.File;
    user?: {
        userId: string;
        role: string;
    };
}
export declare const createAppointment: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPatientAppointments: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const approveAppointment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=appointmentController.d.ts.map