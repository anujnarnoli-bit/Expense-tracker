const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  // Header mein token "Bearer <token>" format mein aata hai
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Token nahi mila, login karein" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Iss request ke liye userId available kar diya
    next(); // Aage badho, route handler chalne do
  } catch (error) {
    return res.status(401).json({ message: "Token invalid hai" });
  }
}

module.exports = protect;
