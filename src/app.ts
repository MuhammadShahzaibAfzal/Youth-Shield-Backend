import express, { Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import cors from "cors";
import Config from "./config";
import authRouter from "./routes/authRoutes";
import categoryRouter from "./routes/categoryRoutes";
import newsRouter from "./routes/newsRoutes";
import screeningRouter from "./routes/screeningRoutes";
import contestRouter from "./routes/contestRoutes";
import contestSubmissionRouter from "./routes/contestSubmissionRoutes";
import leaderBoardRouter from "./routes/leaderBoardRoutes";
import eventRouter from "./routes/eventRoutes";
import registrationRouter from "./routes/registrationRoutes";

const app = express();

app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: [Config.FRONTEND_DOMAIN!, Config.DASHBOARD_DOMAIN!],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
  res.send("YouthShield BACKEND API");
});
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/news", newsRouter);
app.use("/api/screenings", screeningRouter);
app.use("/api/contests", contestRouter);
app.use("/api/contest-submissions", contestSubmissionRouter);
app.use("/api/leaderboard", leaderBoardRouter);
app.use("/api/events", eventRouter);
app.use("/api/registrations", registrationRouter);

app.use(globalErrorHandler);

export default app;
