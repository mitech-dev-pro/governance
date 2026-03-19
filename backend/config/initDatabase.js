import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "./database.js";
import { createIndexes } from "../sql/createIndexes.js";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, "../sql/schema.sql");
    const sql = await fs.readFile(schemaPath, "utf8");

    logger.info("Initializing database schema...");

    await query("SET FOREIGN_KEY_CHECKS = 0");
    await query(sql);
    await query("SET FOREIGN_KEY_CHECKS = 1");

    await createIndexes();

    logger.info("Database schema initialized successfully");
  } catch (error) {
    logger.error(`Database initialization failed: ${error.message}`);
    throw error;
  }
}
