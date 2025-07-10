import { NextFunction, Request, Response, Router } from "express";
import LeaderBoardController from "../controllers/LeaderBoardController";
import asyncHandler from "../utils/asyncHandler";
import LeaderboardService from "../services/LeaderboardService";

const leaderBoardRouter = Router();
const leaderBoardService = new LeaderboardService();
const leaderBoardController = new LeaderBoardController(leaderBoardService);

leaderBoardRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await leaderBoardController.getLeaderBoard(req, res, next);
  })
);

export default leaderBoardRouter;
