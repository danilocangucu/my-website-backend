import express from "express";
import ec2Routes from "./routes/ec2Routes";
import cors from "cors";

const app = express();

// TODO - Add CORS policy
app.use(cors());

app.use(express.json());

app.use("/ec2", ec2Routes);

export default app;
