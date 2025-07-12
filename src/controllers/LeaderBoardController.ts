import { NextFunction, Request, Response } from "express";
import LeaderboardService from "../services/LeaderboardService";

class LeaderBoardController {
  constructor(private leaderBoardServie: LeaderboardService) {}

  async getLeaderBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const { contest, screening, countryFilter, schoolFilter, type } = req.query;
      const result = await this.leaderBoardServie.getLeaderboard({
        limit: 10,
        school: schoolFilter === "all" ? undefined : (schoolFilter as string),
        country: countryFilter === "all" ? undefined : (countryFilter as string),
        contest: contest ? (contest as string) : undefined,
        screening: screening ? (screening as string) : undefined,
        type: type as any,
      });
      res.status(200).json({
        users: result.leaderboard,
        updatedAt: result.updatedAt,
        totalParticipants: result.totalParticipants,
        totalSchools: result.totalSchools,
        totalCountries: result.totalCountries,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LeaderBoardController;
