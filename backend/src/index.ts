import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { authRouter } from "./features/auth/routes";
import { indicatorsRouter } from "./routes/indicators";
import { marketRouter } from "./routes/market";
import { screeningRouter } from "./routes/screening";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  }),
);
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "trading-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/market", marketRouter);
app.use("/api/indicators", indicatorsRouter);
app.use("/api/screening", screeningRouter);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
