import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// REGISTER NEW USER
const postUser = async (req, res) => {
    try {
        const { username, password, fullName } = req.body; // Ambil data dari req body

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Periksa apakah user sudah ada berdasarkan username
        const existingUser = await User.findOne({ where: { username } });

        // Jika user sudah ada, kirimkan error
        if (existingUser) {
            return res.status(400).json({
                status: "error",
                message: "User already exists",
            });
        }

        // Create new user
        const newUser = await User.create({
            username,
            password: hashedPassword,
            fullName,
        });

        // Generate accessToken dengan userId dan username
        const accessToken = jwt.sign(
            { userId: newUser.id, username: newUser.username },
            process.env.ACCESS_SECRET_KEY,
            { expiresIn: "30m" }
        );

        // Generate refreshToken dengan userId dan username
        const refreshToken = jwt.sign(
            { userId: newUser.id, username: newUser.username },
            process.env.REFRESH_SECRET_KEY,
            { expiresIn: "1d" }
        );

        // Update refreshToken di database
        await User.update({ refreshToken }, { where: { id: newUser.id } });

        // Set refreshToken di cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true, // Hanya dapat diakses oleh server
            sameSite: "none", // Untuk cross-site request
            secure: true, // Hanya untuk HTTPS
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            status: "success",
            message: "User registered successfully",
            data: {
                id: newUser.id,
                username: newUser.username,
                fullName: newUser.fullName
            },
            accessToken, // Kirimkan access token ke client
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// USER LOGIN
const loginHandler = async (req, res) => {
    try {
        const { username, password } = req.body; // Ambil data dari req body

        // Periksa apakah user sudah ada beerasarkan username
        const user = await User.findOne({ where: { username } });

        // Mengirimkan error jika user tidak ditemukan
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        // Validasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // Mengirimkan error jika password tidak valid
        if (!isPasswordValid) {
            return res.status(401).json({
                status: "error",
                message: "Invalid Password!",
            });
        }

        // Konversi user ke plain object
        const userPlain = user.toJSON();

        // Membuat objek baru (safeUserData) yang berisi semua properti dari userPlain
        // kecuali 'password' dan 'refreshToken'
        const { password: _, refreshToken: __, ...safeUserData } = userPlain;

        // Generate accessToken safeUserData
        const accessToken = jwt.sign(
            safeUserData,
            process.env.ACCESS_SECRET_KEY,
            { expiresIn: "30m" }
        );

        // Generate refreshToken dengan safeUserData
        const refreshToken = jwt.sign(
            safeUserData,
            process.env.REFRESH_SECRET_KEY,
            { expiresIn: "1d" }
        );

        // Update refreshToken di database
        await User.update({ refreshToken }, { where: { id: user.id } });

        // Set refreshToken di cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true, // Hanya dapat diakses oleh server
            sameSite: "none", // Untuk cross-site request
            secure: true, // Hanya untuk HTTPS
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            status: "success",
            message: "Login successful",
            user: safeUserData,
            accessToken,
        });
    } catch (error) {
        res.status(500).json({
            status: "Login Error: ",
            message: error.message
        });
    }
};

// LOGOUT HANDLER
const logoutHandler = async (req, res) => {
    try {

        // Ambil refresh token dari cookie
        const refreshToken = req.cookies.refreshToken;

        // Jika tidak ada refresh token, kirim status 204
        if (!refreshToken) return res.sendStatus(204); 

        // Cari user berdasarkan refresh token
        const user = await User.findOne({
            where: { refreshToken },
        });

        // Jika user tidak ditemukan, kirim status 204
        if (!user) return res.sendStatus(204);

        // Clear refreshToken di database
        await User.update(
            { refreshToken: null },
            {
                where: {
                    id: user.id,
                },
            }
        );

        // Clear cookie
        res.clearCookie("refreshToken", {
            httpOnly: true, // Hanya dapat diakses oleh server
            sameSite: "none", // Untuk cross-site request
            secure: true, // Hanya untuk HTTPS
        });

        return res.status(200).json({
            status: "success",
            message: "Logout successful",
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// DELETE USER ACCOUNT
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // ID user dari params
        const loggedInUserId = req.user.id; // ID user dari middleware verifyToken

        // Memastikan user yang ingin dihapus adalah user yang sedang login
        if (parseInt(id) !== loggedInUserId) {
            return res.status(403).json({
                status: "error",
                message: "Forbidden: You can only delete your own account",
            });
        }

        // Hapus user dari database
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        // Delete user
        await User.destroy({ where: { id } });

        // Clear refreshToken di cookie
        res.clearCookie("refreshToken", {
            httpOnly: true, // Hanya dapat diakses oleh server
            sameSite: "none", // Untuk cross-site request
            secure: true, // Hanya untuk HTTPS
        });

        res.status(200).json({
            status: "success",
            message: "Account deleted successfully!",
        });
    } catch (error) {
        res.status(500).json({
            status: "error", 
            message: error.message 
        });
    }
};

// EDIT USER ACCOUNT
const editUser = async (req, res) => {
    try {
        const userId = req.user.id; // Dari middleware verifyToken
        const { username, fullName, password } = req.body;

        // Cari user berdasarkan ID
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        // Update user dengan nilai baru atau pertahankan nilai lama
        const updatedUser = await user.update({
            username: username || user.username,
            fullName: fullName || user.fullName,
            password: password ? await bcrypt.hash(password, 10) : user.password
        });

        // Jangan kembalikan data sensitif
        const { password: _, refreshToken: __, ...safeUserData } = updatedUser.toJSON();

        res.status(200).json({
            status: "success",
            message: "User updated successfully",
            data: safeUserData
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error", 
            message: error.message 
        });
    }
};

export {
    postUser,
    deleteUser,
    loginHandler,
    editUser,
    logoutHandler,
};