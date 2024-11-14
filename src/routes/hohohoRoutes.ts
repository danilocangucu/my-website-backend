import { Router } from "express";
import {
  getApplication,
  loginApplication,
  registerApplication,
  postApplication,
} from "../controllers/hohohoController";
import { hohohoAuthMiddleware } from "../middlewares/hohohoAuthMiddleware";

const router = Router();

router.post("/register", registerApplication);
router.post("/login", loginApplication);
router.get("/applications/", hohohoAuthMiddleware, getApplication);
router.post("/applications/", hohohoAuthMiddleware, postApplication);

export default router;
