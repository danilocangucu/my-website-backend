import { Pool } from "pg";
import dotenv from "dotenv";

// TODO merge this with the other database file?

dotenv.config();

const hohohoPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.HOHOHO_DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

export default hohohoPool;
