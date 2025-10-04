import { Request, Response, NextFunction } from 'express';
export interface APIError extends Error {
    statusCode?: number;
    code?: string;
    details?: any;
}
export declare const errorHandler: (error: APIError, req: Request, res: Response, next: NextFunction) => void;
export declare const createError: (message: string, statusCode?: number, code?: string, details?: any) => APIError;
//# sourceMappingURL=errorHandler.d.ts.map