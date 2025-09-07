import { QueryParams } from "@Types/helperTypes/Request";
import type { NextFunction, Request, Response } from "express"

type Controller = (request:Request, response:Response, next:NextFunction) => Promise<any>

export const catchAsync = (asyncFunction:Controller) => {
    return (request:Request<{}, {}, {}, QueryParams>, response:Response, next:NextFunction ) => {
        asyncFunction(request, response, next ).catch ((error:Error) => {
            console.log(error);
            next(error);
        });
    }
}