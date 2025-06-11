import { expressjwt } from "express-jwt";
import { Request } from "express";
import Config from "../config";
import { AuthCookie } from "../types";

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET_KEY!,
  algorithms: ["HS256"],
  getToken(req: Request) {
    const authHeader = req.headers.authorization;
    let tokenFromHeader = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      tokenFromHeader = authHeader.split(" ")[1]; // Extract token after 'Bearer '
    }
    console.log("tokenFromHeader : ", tokenFromHeader);
    const { refreshToken } = req.cookies as AuthCookie;
    return refreshToken;
  },
});
