import jwt from "jsonwebtoken";
// import userModel from "../models/userss.model.js"; // Import user model

export const authUser = async (req, res, next) => {
    try {
        console.log("Headers received:", req.headers);

        const token = req.cookies.token || req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();

        if (!token) {
            console.log("No token provided");
            return res.status(401).json({ error: "Unauthorized user" });
        }
        console.log("Extracted Token:", token);


        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);

        // const user = await userModel.findOne({ email: decoded.email }).select("+password");
        // console.log("User found:", user);

        // if (!user) {
        //     return res.status(401).json({ error: "User not found" });
        // }
        console.log("JWT Secret:", process.env.JWT_SECRET);

        req.user =decoded;
        next();
    } catch (error) {
        console.log("JWT Verification Error:", error.message);
        return res.status(401).json({ error: "Unauthorized" });
    }
};