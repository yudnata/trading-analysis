import { Router } from "express";

export const authRouter = Router();

authRouter.get("/health", (_req, res) => {
  try {
    res.json({ ok: true, feature: "auth" });
  } catch (err) {
    res.status(500).json({ error: "internal_error" });
  }
});
