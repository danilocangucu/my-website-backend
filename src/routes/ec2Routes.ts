import { Router } from "express";
import {
  startEC2Instance,
  terminateEC2Instance,
} from "../controllers/ec2Controller";

const router = Router();

router.post("/", startEC2Instance);
router.delete("/", terminateEC2Instance);

export default router;
