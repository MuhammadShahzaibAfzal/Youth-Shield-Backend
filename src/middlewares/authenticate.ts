import { expressjwt } from "express-jwt";
import { NextFunction, Request, Response } from "express";
import Config from "../config";
import { AuthCookie } from "../types";

export default expressjwt({
  secret: Config.ACCESS_TOEKN_SECRET_KEY!,
  algorithms: ["HS256"],
  getToken(req: Request) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.split(" ")[1] !== "undefined") {
      const token = authHeader.split(" ")[1];
      if (token) {
        return token;
      }
      // console.log("Token : ", token);
    }

    const { accessToken } = req.cookies as AuthCookie;
    // console.log("Access Token : ", accessToken);
    return accessToken;
  },
});

const jwtErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or missing token",
      error: err.message,
    });
  }
  next(err);
};

export { jwtErrorHandler };
