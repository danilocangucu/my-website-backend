import { Router } from "express";
import {
  loadApplication,
  startApplication,
} from "../controllers/hohohoController";

const router = Router();

router.post("/start", startApplication);
router.post("/load", loadApplication);

export default router;
