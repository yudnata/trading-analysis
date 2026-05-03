import { Router } from "express";

export const indicatorsRouter = Router();

indicatorsRouter.get("/health", (_req, res) => {
  try {
    res.json({ ok: true, feature: "indicators" });
  } catch (err) {
    res.status(500).json({ error: "internal_error" });
  }
});
