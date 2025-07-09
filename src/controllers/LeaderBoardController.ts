import { NextFunction, Request, Response } from "express";
import ContestSubmissionService from "../services/ContestSubmissionService";

class LeaderBoardController {
  constructor(private contestSubmissionService: ContestSubmissionService) {}

  async getLeaderBoard(req: Request, res: Response, next: NextFunction) {
    const { searchTerm, countryFilter, schoolFilter } = req.query;
    console.log(searchTerm, countryFilter, schoolFilter);
    try {
      const contestSubmission = await this.contestSubmissionService.aggregateTotalScores({
        searchTerm: searchTerm as string,
        countryFilter: countryFilter === "all" ? undefined : (countryFilter as string),
        schoolFilter: schoolFilter === "all" ? undefined : (schoolFilter as string),
      });
      return res.status(200).json({
        message: "LeaderBoard fetched successfully",

        users: contestSubmission?.map((entry, index) => ({
          _id: entry._id,
          name: `${entry.user.firstName} ${entry.user.lastName}`,
          imageURL: entry.user.imageURL,
          points: entry.totalScore,
          country: entry.user.country,
          countryCode: entry.user.countryCode,
          rank: index + 1,
          school: "Testing",
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LeaderBoardController;
