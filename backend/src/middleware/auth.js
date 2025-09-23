import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;
//console.log("JWT_SECRET from env:", process.env.JWT_SECRET);
//check if user is logged in
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.JWT_TOKEN_QUICKBITE;
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decode = jwt.verify(token, JWT_SECRET);

    req.user = decode;
    
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

//allow only main admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }
  next();
};
