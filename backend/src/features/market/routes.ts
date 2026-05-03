import { Router } from "express";

export const marketRouter = Router();

marketRouter.get("/health", (_req, res) => {
  try {
    res.json({ ok: true, feature: "market" });
  } catch (err) {
    res.status(500).json({ error: "internal_error" });
  }
});
