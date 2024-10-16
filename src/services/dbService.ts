import pool from "../config/database";

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT NOW()");
    client.release();
    return res.rows[0].now;
  } catch (err) {
    throw new Error(`Database connection error: ${err}`);
  }
};
