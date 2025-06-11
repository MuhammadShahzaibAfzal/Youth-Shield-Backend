import express, { Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import cors from "cors";
import Config from "./config";
import authRouter from "./routes/authRoutes";
import categoryRouter from "./routes/categoryRoutes";
import blogRouter from "./routes/blogRoutes";
import webinarsRouter from "./routes/webinarsRoutes";

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
app.use("/api/blogs", blogRouter);
app.use("/api/webinars", webinarsRouter);

app.use(globalErrorHandler);

export default app;
