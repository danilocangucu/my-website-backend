import express from "express";
import cors from "cors";

import ec2Routes from "./routes/ec2Routes";
import errorRoutes from "./routes/errorRoutes";

const app = express();

// TODO - Add CORS policy
app.use(cors());

app.use(express.json());

app.use("/ec2", ec2Routes);
app.use("/errors", errorRoutes);

export default app;
