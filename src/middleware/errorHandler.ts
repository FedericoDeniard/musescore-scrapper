import { NextFunction, Request, Response } from 'express';
import { HttpError, ResponseObject } from 'src/utils/response';

export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json(new ResponseObject(false, err.message, null));
}