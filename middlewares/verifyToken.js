dotenv.config();
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verifyToken = async (req, res, next) => {
    try {
        // Cek apakah token ada di header
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized: No token provided"
            });
        }

        // Extrak token
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
        
        // Cek apakah user ada di database berdasarkan id dari token
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'username', 'fullName']
        });
        
        // Mengembalikan error jika user tidak ditemukan
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized: User no longer exists"
            });
        }

        // Simpan informasi user ke dalam req.user
        req.user = {
            id: user.id,
            username: user.username,
            fullName: user.fullName
        };

        // Lanjutkan ke middleware berikutnya
        next();
    } catch (error) {
        // Handle token errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized: Token expired"
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized: Invalid token"
            });
        }

        res.status(500).json({
            status: "error",
            message: "Internal server error during authentication"
        });
    }
};

export default verifyToken;