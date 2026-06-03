import db from '../db/db.js';

export const logAudit = (userId, action, endpoint) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (user_id, action, endpoint)
      VALUES (?, ?, ?)
    `);
    stmt.run(userId || null, action, endpoint);
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

// Express middleware for logging requests automatically if desired
export const auditMiddleware = (actionName) => {
  return (req, res, next) => {
    // We log after request completes successfully, or immediately.
    // Let's log after the handler completes, or let controllers log explicitly since they have access to context (like register's new userId)
    next();
  };
};
