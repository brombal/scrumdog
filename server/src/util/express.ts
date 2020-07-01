import * as e from "express";
import { delay } from "./misc";

export enum HttpStatus {
  OK = 200,
  Created = 201,
  NoContent = 204,
  MovedPermanently = 301,
  Found = 302,
  BadRequest = 400,
  Unauthorized = 401,
  Unauthenticated = 401,
  WhoAreYou = 401,
  Forbidden = 403,
  NotAllowed = 403,
  NotFound = 404,
  ServerError = 500,
}

declare module "express" {
  interface Request {
  }
}

export class ApiError extends Error {
  constructor(
    public errorCode: string,
    public httpStatus: number = HttpStatus.BadRequest,
    public errorData: any = null
  ) {
    super(errorCode);
  }
}

/**
 * Wraps an express request handler to better handle async methods.
 */
export function asyncHandler(method: e.Handler): e.RequestHandler {
  return async function(req: e.Request, res: e.Response, next: e.NextFunction) {
    try {
      await method(req, res, () => null);
      if (!res.headersSent) next();
    } catch (e) {
      next(e);
    }
  };
}

/**
 * Wraps an express request param handler to better handle async methods.
 */
export function asyncParamHandler(
  method: (req: e.Request, res: e.Response, next: e.NextFunction, value: any, name: string) => Promise<any>
): e.RequestParamHandler {
  return async function(req: e.Request, res: e.Response, next: e.NextFunction, value: any, name: string) {
    try {
      await method(req, res, next, value, name);
    } catch (e) {
      next(e);
    }
  };
}

/**
 * Express middleware that delays a response by a number of ms.
 */
export function delayHandler(ms: number) {
  return asyncHandler(async () => {
    await delay(ms * 1000);
  });
}

type TypedRequestHandler<RequestType, ResponseType> = (
  body: RequestType,
  req?: e.Request,
  res?: e.Response,
  next?: e.NextFunction
) => Promise<ResponseType> | ResponseType;

/**
 * Converts a typed async method to an express request handler.
 * The method should take any value (the request body) as the first parameter, as well as the usual express req, res, next methods.
 * It should return the value you want to send in the response.
 *
 * easyHandler(async function(body: RequestType, req, res): Promise<ResponseType> {
 *   return { };
 * })
 */
export function easyHandler<RequestType, ResponseType>(
  handler: TypedRequestHandler<RequestType, ResponseType>
): e.RequestHandler {
  return async (req: e.Request, res: e.Response, next: e.NextFunction) => {
    try {
      const data = await handler(req.method === "GET" ? req.query : req.body, req, res, next);
      res.send(data);
    } catch (e) {
      next(e);
    }
  };
}

