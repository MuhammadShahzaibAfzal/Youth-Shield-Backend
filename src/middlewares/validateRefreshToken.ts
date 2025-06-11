import { expressjwt } from "express-jwt";
import { Request } from "express";
import Config from "../config";
import logger from "../config/logger";
import { AuthCookie, IRefreshTokenPayload } from "../types";
import RefreshTokenModel from "../models/RefreshTokenModel";

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET_KEY!,
  algorithms: ["HS256"],
  getToken(req: Request) {
    const authHeader = req.headers.authorization;
    let tokenFromHeader = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      tokenFromHeader = authHeader.split(" ")[1]; // Extract token after 'Bearer '
    }
    const { refreshToken } = req.cookies as AuthCookie;
    return refreshToken || tokenFromHeader || "";
  },
  async isRevoked(request: Request, token) {
    try {
      const refreshToken = await RefreshTokenModel.findOne({
        _id: (token?.payload as IRefreshTokenPayload).id,
      });
      return refreshToken === null;
    } catch (err) {
      logger.error("Error while getting the refresh token", {
        id: (token?.payload as IRefreshTokenPayload).id,
      });
    }
    return true;
  },
});
