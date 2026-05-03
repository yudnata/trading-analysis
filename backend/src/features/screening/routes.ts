import { Router } from "express";

export const screeningRouter = Router();

screeningRouter.get("/health", (_req, res) => {
  try {
    res.json({ ok: true, feature: "screening" });
  } catch (err) {
    res.status(500).json({ error: "internal_error" });
  }
});
