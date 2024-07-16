const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Token not found.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("JWT Error:", err);
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(400);
      throw new Error("Invalid token.");
    } else if (err instanceof jwt.TokenExpiredError) {
      res.status(401);
      throw new Error("Token has expired.");
    } else if (err instanceof jwt.NotBeforeError) {
      res.status(403);
      throw new Error("Token not active.");
    } else {
      res.status(500);
      throw new Error("Internal server error");
    }
  }
});

module.exports = validateToken;
