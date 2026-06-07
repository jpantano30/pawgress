import pool from '../db/pool.js';

/**
 * Middleware that checks the user's role in our DB.
 * Clerk handles authentication; we handle authorization.
 */
export function requireRole(requiredRole) {
  return async (req, res, next) => {
    try {
      const { userId } = req.auth;
      const { rows: [user] } = await pool.query(
        'SELECT role FROM users WHERE clerk_id = $1',
        [userId]
      );

      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.role !== requiredRole) {
        return res.status(403).json({ error: `Requires ${requiredRole} role` });
      }

      // Attach internal user id for convenience
      req.auth.userId = user.id;
      req.auth.role = user.role;
      next();
    } catch (err) { next(err); }
  };
}
