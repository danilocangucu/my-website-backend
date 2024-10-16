import express from "express";
import ec2Routes from "./routes/ec2Routes";

const app = express();

app.use(express.json());

app.use("/ec2", ec2Routes);

export default app;
