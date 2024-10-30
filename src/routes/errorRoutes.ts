import { Router } from "express";
import { reportError } from "../controllers/errorController";

const router = Router();

router.post("/report", reportError);

export default router;
