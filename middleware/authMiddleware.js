const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized: Tidak ada token yang diberikan.",
    });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: Token tidak valid.",
      });
    }
    req.user = user;
    next();
  });
};

module.exports = authMiddleware;
