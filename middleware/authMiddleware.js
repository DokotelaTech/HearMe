const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Export BOTH names so all routes work without changes
module.exports = { verifyToken, authMiddleware: verifyToken };