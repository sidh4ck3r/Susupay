const jwt = require('jsonwebtoken');

const adminMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'ADMIN' && decoded.role !== 'AUDITOR') {
      return res.status(403).json({ message: 'Access denied: Admin or Auditor role required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = adminMiddleware;
