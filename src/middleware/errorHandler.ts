import { NextFunction, Request, Response } from 'express';
import { HttpError, ResponseObject } from 'src/utils/response';

export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    console.log(err.message)
    res.status(err.status || 500).json(new ResponseObject(false, err.message, null));
}