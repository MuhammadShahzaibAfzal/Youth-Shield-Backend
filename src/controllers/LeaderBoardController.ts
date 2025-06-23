import { NextFunction, Request, Response } from "express";
import ContestSubmissionService from "../services/ContestSubmissionService";
import UserService from "../services/UserService";

class LeaderBoardController {
  constructor(private contestSubmissionService: ContestSubmissionService) {}

  async getLeaderBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const contestSubmission =
        await this.contestSubmissionService.aggregateTotalScores();
      return res.status(200).json({
        message: "LeaderBoard fetched successfully",
        users: contestSubmission?.map((entry, index) => ({
          _id: entry._id,
          firstName: entry.user.firstName,
          lastName: entry.user.lastName,
          imageURL: entry.user.imageURL,
          totalScore: entry.totalScore,
          country: entry.user.country,
          countryCode: entry.user.countryCode,
          rank: index + 1,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LeaderBoardController;
