import { NextFunction, Request, Response } from "express";

import createHttpError from "http-errors";
import { AuthRequest } from "../types";

export const canAccess = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as AuthRequest & Request;
    const roleFromToken = _req?.auth?.role;
    // console.log("roleFromToken", roleFromToken);
    if (!roles.includes(roleFromToken)) {
      const error = createHttpError(403, "You don't have enough permissions");

      next(error);
      return;
    }
    next();
  };
};
