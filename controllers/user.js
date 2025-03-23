const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

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
                message: "User already exists"
            });
        }

        // create user baru
        const newUser = await User.create({
            username,
            password: hashedPassword, // password yang sudah di-hash
            fullName
        });

        // generate jwt token
        const token = jwt.sign({
            userId: newUser.id
        }, process.env.TOKEN_SECRET_KEY, {
            expiresIn: "1h"
        })

        res.status(201).json({
            status: "success",
            message: "User registered successfully",
            data: { id: newUser.id, username: newUser.username }
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
                message: "User not found"
            });
        }

        // validasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: "error",
                message: "Invalid Password!"
            });
        }

        // generate jwt token
        const token = jwt.sign({
            id: user.id,
            username: user.username,
            fullName: user.fullName
        },
            process.env.TOKEN_SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            status: "success",
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName
            }
        });
    } catch (error) {
        res.status(500).json({ status: "Login Error: ", message: error.message });
    }
};

// DELETE USER ACCOUNT - TESTED
const deleteUser = async (req, res, next) => {
    try {
        // mengambil token
        const header = req.headers;
        const authorization = header.authorization;
        let token;

        // cek apakah user sudah login
        if (authorization !== undefined && authorization.startsWith("Bearer ")) {
            token = authorization.substring(7);
        } else {
            const error = new Error("You need to login");
            error.statusCode = 403;
            throw error;
        }

        // decode token untuk mendapatkan userId yang sedang login
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        const loggedInUserId = decoded.id;

        // ambil id user yang akan diedit dari params
        const { id } = req.params;

        // cek apakah user yang sedang login mencoba mengedit akun user lain
        if (parseInt(id) !== loggedInUserId) {
            return res.status(403).json({ status: "error", message: "You don't have access" });
        }

        // cek apakah ada user yang akan dihapus
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        // hapus user
        await User.destroy({ where: { id } });
        res.status(200).json({ status: "success", message: "Account deleted successfully!" });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// EDIT USER ACCOUNT - TESTED
const editUser = async (req, res) => {
    try {
        // ambil token dari header
        const authorization = req.headers.authorization;
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(403).json({ status: "error", message: "You need to login" });
        }

        // decode token untuk mendapatkan userId yang sedang login
        const token = authorization.substring(7);
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        const id = decoded.id; // ambil id user dari token

        // ambil data yang akan diperbarui dari request body
        const { username, fullName, password } = req.body;

        // cek apakah user yang ingin diedit ada
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        // hash password jika diberikan
        let updatedFields = { username, fullName };
        if (password) {
            updatedFields.password = await bcrypt.hash(password, 10);
        }

        // update user
        await user.update(updatedFields);

        // ambil kembali data user setelah update
        const updatedUser = await User.findByPk(id, {
            attributes: ["id", "username", "fullName"]
        });

        res.status(200).json({
            status: "success",
            message: "User updated successfully",
            data: updatedUser
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

module.exports = {
    postUser,
    deleteUser,
    loginHandler,
    editUser
};
