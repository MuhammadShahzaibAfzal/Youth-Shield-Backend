import { NextFunction, Request, Response, Router } from "express";
import LeaderBoardController from "../controllers/LeaderBoardController";
import asyncHandler from "../utils/asyncHandler";
import ContestSubmissionService from "../services/ContestSubmissionService";

const leaderBoardRouter = Router();
const contestSubmissionService = new ContestSubmissionService();
const leaderBoardController = new LeaderBoardController(contestSubmissionService);

leaderBoardRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await leaderBoardController.getLeaderBoard(req, res, next);
  })
);

export default leaderBoardRouter;
