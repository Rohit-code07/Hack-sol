import { Router } from "express";
import { sendSuccess } from "../utils/ApiResponse.js";

const router = Router();

router.get("/health", (req, res) => sendSuccess(res, { status: "ok" }));

// Naye route files yahan mount honge (chunk 2 onwards).

export default router;