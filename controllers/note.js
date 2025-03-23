const Note = require("../models/Note");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// TOKEN VERIFICATION
const verifyToken = (req) => {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
        throw new Error("You need to login");
    }

    const token = authorization.substring(7);
    return jwt.verify(token, process.env.TOKEN_SECRET_KEY);
};

// NEW NOTE - TESTED
const createNote = async (req, res) => {
    try {
        const decoded = verifyToken(req);

        const { noteTitle, noteContent } = req.body;

        // membuat note baru dengan user yang login
        const newNote = await Note.create({
            userId: decoded.id,
            noteTitle,
            noteContent
        });

        res.status(201).json({
            status: "success",
            message: "Note created successfully!",
            data: newNote
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// NOTE DETAILS - TESTED
const getNoteById = async (req, res) => {
    try {
        const decoded = verifyToken(req);

        // mengambil note berdasarkan id dan user yang login
        const note = await Note.findOne({
            where: { 
                id: req.params.noteId, 
                userId: decoded.id 
            },
            attributes: [
                "id", 
                "noteTitle", 
                "noteContent", 
                "createdAt", 
                "updatedAt"]
        });

        if (!note) {
            return res.status(404).json({
                status: "error",
                message: "Note not found."
            });
        }

        res.status(200).json({ status: "success", data: note });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// DELETE NOTE - TESTED
const deleteNote = async (req, res) => {
    try {
        const decoded = verifyToken(req);

        // cari note berdasarkan id
        const note = await Note.findByPk(req.params.noteId);

        // jika note tidak ditemukan, kembalikan error 404
        if (!note) {
            return res.status(404).json({
                status: "error",
                message: "Note not found."
            });
        }

        // pastikan user yang menghapus adalah pemilik note
        if (note.userId !== decoded.id) {
            return res.status(403).json({
                status: "error",
                message: "Unauthorized to delete this note."
            });
        }

        // hapus note
        await note.destroy();

        res.status(200).json({
            status: "success",
            message: "Note deleted successfully.",
            deletedNote: {
                id: note.id,
                noteTitle: note.noteTitle,
                noteContent: note.noteContent
            }
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};


// FETCH ALL NOTE - TESTED
const getAllNotes = async (req, res) => {
    try {
        const decoded = verifyToken(req);

        // ambil semua note milik user yang login
        const notes = await Note.findAll({
            where: { userId: decoded.id },
            attributes: ["id", "noteTitle", "noteContent", "createdAt"]
        });

        res.status(200).json({
            status: "success",
            total: notes.length,
            data: notes
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// EDIT NOTE - TESTED
const editNote = async (req, res) => {
    try {
        const decoded = verifyToken(req);
        const userId = decoded.id;
        const { noteTitle, noteContent } = req.body;
        const noteId = req.params.noteId;

        // pastikan hanya mengedit note yang dimiliki oleh user yang login
        const note = await Note.findOne({
            where: { id: noteId, userId: userId } // filter berdasarkan noteId dan userId
        });

        if (!note) {
            return res.status(403).json({ status: "error", message: "Unauthorized to edit this note." });
        }

        // update note
        const editedNote = await note.update({ noteTitle, noteContent });

        res.status(200).json({ 
            status: "success", 
            message: "Note updated successfully", 
            data: editedNote 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};


module.exports = {
    createNote,
    getNoteById,
    deleteNote,
    getAllNotes,
    editNote
};
