const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.user_type) {
      return res.status(401).json({ error: 'Authentication error: User data is missing.' });
    }

    const { user_type: userType } = req.user;

    if (Array.isArray(allowedRoles)) {
      if (allowedRoles.includes(userType)) {
        next();
      } else {
        res.status(403).json({ error: 'Forbidden: You do not have the necessary permissions to perform this action.' });
      }
    } else if (typeof allowedRoles === 'string') {
      if (userType === allowedRoles) {
        next();
      } else {
        res.status(403).json({ error: 'Forbidden: You do not have the necessary permissions to perform this action.' });
      }
    } else {
      // If the roles are not in a recognized format, deny access for security.
      res.status(500).json({ error: 'Server error: Invalid role configuration.' });
    }
  };
};

module.exports = authorizeRole; 