import { Router } from "express";
import { startEC2Instance } from "../controllers/ec2Controller";

const router = Router();

router.post("/", startEC2Instance);

export default router;
