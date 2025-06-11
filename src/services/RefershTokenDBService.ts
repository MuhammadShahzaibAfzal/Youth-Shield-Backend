import RefreshTokenModel from "../models/RefreshTokenModel";

class RefreshTokenServiceDB {
  async saveToken(userID: string) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
    const token = await RefreshTokenModel.create({
      userID,
      expiresAt: Date.now() + MS_IN_YEAR,
    });
    return token;
  }

  async deleteToken(tokenID: string) {
    await RefreshTokenModel.findByIdAndDelete(tokenID);
  }
}
export default RefreshTokenServiceDB;
