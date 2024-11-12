import { Router } from "express";
import { startApplication } from "../controllers/hohohoController";

const router = Router();

router.post("/start", startApplication);

export default router;
