import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// REGISTER NEW USER - TESTED
const postUser = async (req, res) => {
    try {
        const { username, password, fullName } = req.body;

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // periksa apakah user sudah ada
        const existingUser = await User.findOne({ where: { username } });

        if (existingUser) {
            return res.status(400).json({
                status: "error",
                message: "User already exists",
            });
        }

        // create user baru
        const newUser = await User.create({
            username,
            password: hashedPassword,
            fullName,
        });

        // generate jwt tokens
        const accessToken = jwt.sign(
            { userId: newUser.id, username: newUser.username },
            process.env.ACCESS_SECRET_KEY,
            { expiresIn: "30m" }
        );

        const refreshToken = jwt.sign(
            { userId: newUser.id, username: newUser.username },
            process.env.REFRESH_SECRET_KEY,
            { expiresIn: "1d" }
        );

        // Update refresh token in database
        await User.update({ refreshToken }, { where: { id: newUser.id } });

        // Set refresh token in cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: false,
            sameSite: "none",
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            status: "success",
            message: "User registered successfully",
            data: { id: newUser.id, username: newUser.username },
            accessToken,
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// USER LOGIN - TESTED
const loginHandler = async (req, res) => {
    try {
        const { username, password } = req.body;

        // periksa apakah user sudah ada
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        // validasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                status: "error",
                message: "Invalid Password!",
            });
        }

        // Convert user to plain object
        const userPlain = user.toJSON();
        const { password: _, refreshToken: __, ...safeUserData } = userPlain;

        // generate jwt tokens
        const accessToken = jwt.sign(
            safeUserData,
            process.env.ACCESS_SECRET_KEY,
            { expiresIn: "30m" }
        );

        const refreshToken = jwt.sign(
            safeUserData,
            process.env.REFRESH_SECRET_KEY,
            { expiresIn: "1d" }
        );

        // Update refresh token in database
        await User.update({ refreshToken }, { where: { id: user.id } });

        // Set refresh token in cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: false,
            sameSite: "none",
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            status: "success",
            message: "Login successful",
            user: safeUserData,
            accessToken,
        });
    } catch (error) {
        res.status(500).json({ status: "Login Error: ", message: error.message });
    }
};

// LOGOUT HANDLER
const logoutHandler = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.sendStatus(204);

        const user = await User.findOne({
            where: { refreshToken },
        });

        if (!user) return res.sendStatus(204);

        // Clear refresh token in database
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
            httpOnly: true,
            sameSite: "none",
            secure: true,
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

// DELETE USER ACCOUNT - TESTED
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const loggedInUserId = req.user.id; // From verifyToken middleware

        // Memastikan user yang ingin dihapus adalah user yang sedang login
        if (parseInt(id) !== loggedInUserId) {
            return res.status(403).json({
                status: "error",
                message: "Forbidden: You can only delete your own account",
            });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        // hapus user
        await User.destroy({ where: { id } });

        // Clear refresh token cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });

        res.status(200).json({
            status: "success",
            message: "Account deleted successfully!",
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// EDIT USER ACCOUNT - TESTED
const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const loggedInUserId = req.user.id; // From verifyToken middleware

        // Memastikan user yang ingin diupdate adalah user yang sedang login
        if (parseInt(id) !== loggedInUserId) {
            return res.status(403).json({
                status: "error",
                message: "Forbidden: You can only edit your own account",
            });
        }

        const userToUpdate = await User.findByPk(id);
        if (!userToUpdate) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        const { username, fullName, password } = req.body;

        let updatedFields = {};
        if (username !== undefined) updatedFields.username = username;
        if (fullName !== undefined) updatedFields.fullName = fullName;
        if (password) {
            updatedFields.password = await bcrypt.hash(password, 10);
        }

        await userToUpdate.update(updatedFields);

        const updatedUser = await User.findByPk(id, {
            attributes: ["id", "username", "fullName"],
        });

        res.status(200).json({
            status: "success",
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export {
    postUser,
    deleteUser,
    loginHandler,
    editUser,
    logoutHandler,
};