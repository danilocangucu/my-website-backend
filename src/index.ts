import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
});