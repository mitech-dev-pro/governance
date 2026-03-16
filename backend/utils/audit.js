// backend/utils/audit.js
import { query } from "../config/database.js";

export const logActivity = async (
  userId,
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
) => {
  try {
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_values, new_values)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        entityType,
        entityId,
        JSON.stringify(oldValues),
        JSON.stringify(newValues),
      ],
    );
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
