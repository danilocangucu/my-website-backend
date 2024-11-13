import { Router } from "express";
import {
  loadApplication,
  loginApplication,
  registerApplication,
} from "../controllers/hohohoController";
import { hohohoAuthMiddleware } from "../middlewares/hohohoAuthMiddleware";

const router = Router();

router.post("/register", registerApplication);
router.post("/login", loginApplication);
router.get("/applications/", hohohoAuthMiddleware, loadApplication);

export default router;
