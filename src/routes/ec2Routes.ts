import { Router } from "express";
import {
  getEC2InstanceStatus,
  startEC2Instance,
  terminateEC2Instance,
} from "../controllers/ec2Controller";

const router = Router();

router.post("/", startEC2Instance);
router.delete("/", terminateEC2Instance);
router.get("/", getEC2InstanceStatus);

export default router;
