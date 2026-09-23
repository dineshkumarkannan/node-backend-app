import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  // This learning version expects the raw JWT in the Authorization header.
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Verify the token before allowing access to protected routes.
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    // Pass the authenticated user's ID to the todo route handlers.
    req.userId = decoded.id;
    next();
  });
}
