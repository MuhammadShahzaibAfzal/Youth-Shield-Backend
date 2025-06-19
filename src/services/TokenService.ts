import { JwtPayload, sign, verify } from "jsonwebtoken";
import Config from "../config";
import createHttpError from "http-errors";
import RefreshTokenServiceDB from "./RefershTokenDBService";

export class TokenService {
  constructor(private tokenServiceDB: RefreshTokenServiceDB) {}

  generateAccessToken(payload: JwtPayload) {
    const accessToken = sign(payload, Config.ACCESS_TOEKN_SECRET_KEY!, {
      algorithm: "HS256",
      expiresIn: "2m",
      issuer: "YouthShield",
    });
    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET_KEY!, {
      algorithm: "HS256",
      expiresIn: "10m",
      issuer: "YouthShield",
      jwtid: String(payload.id),
    });

    return refreshToken;
  }

  async persistRefreshToken(userID: string) {
    const newRefreshToken = await this.tokenServiceDB.saveToken(userID);
    return newRefreshToken;
  }

  async deleteRefreshToken(tokenID: string): Promise<void> {
    await this.tokenServiceDB.deleteToken(tokenID);
  }

  async generateForgetPasswordToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.FORGET_PASSWORD_TOKEN_SECRET!, {
      algorithm: "HS256",
      expiresIn: "2m",
      issuer: "auth-service",
    });

    return refreshToken;
  }

  async verifyForgetPasswordToken(token: string) {
    try {
      const decoded = verify(token, Config.FORGET_PASSWORD_TOKEN_SECRET!) as JwtPayload;
      if (typeof decoded === "string" || !decoded.email) {
        throw createHttpError(400, "Invalid token");
      }
      const email = decoded.email as string;
      return email;
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "TokenExpiredError") {
          throw createHttpError(400, "Password Reset token expired");
        } else if (err.name === "JsonWebTokenError") {
          throw createHttpError(400, "Invalid password reset token");
        }
        throw err;
      }
    }
  }
}

export default TokenService;
