import Note from "../models/Note.js";
import User from "../models/User.js";

// NEW NOTE
const createNote = async (req, res) => {
    try {
        const { noteTitle, noteContent } = req.body; // noteTitle dan noteContent dari req body
        const userId = req.user.id; // userId dari middleware verifyToken

        // Validasi field noteTitle
        if (!noteTitle) {
            return res.status(400).json({
                status: "error",
                message: "Note title is required"
            });
        }

        // Create new note
        const newNote = await Note.create({
            userId,
            noteTitle,
            noteContent
        });

        res.status(201).json({
            status: "success",
            message: "Note created successfully",
            data: newNote
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// GET NOTE BY ID
const getNoteById = async (req, res) => {
    try {
        const { noteId } = req.params; // noteId dari params
        const userId = req.user.id; // userId dari middleware verifyToken

        // Cari note berdasarkan noteId dan userId
        const note = await Note.findOne({
            where: { 
                id: noteId,
                userId 
            },
            include: [{
                model: User, // Dari tabel User
                attributes: ['id', 'username']
            }],
            attributes: ['id', 'noteTitle', 'noteContent', 'createdAt', 'updatedAt']
        });

        // Mengembalikan error jika note tidak ditemukan atau user tidak memiliki akses
        if (!note) {
            return res.status(404).json({
                status: "error",
                message: "Note not found or you don't have access"
            });
        }

        res.status(200).json({
            status: "success",
            data: note
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// GET ALL NOTES BY USER
const getAllNotes = async (req, res) => {
    try {
        const userId = req.user.id; // userId dari middleware verifyToken

        const notes = await Note.findAll({
            where: { userId },
            include: [{
                model: User, // Dari tabel User
                attributes: ['id', 'username']
            }],
            attributes: ['id', 'noteTitle', 'noteContent', 'createdAt'],
            order: [['createdAt', 'DESC']] // Diurutkan berdasarkan waktu dibuat secara descending
        });

        res.status(200).json({
            status: "success",
            results: notes.length,
            data: notes
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// UPDATE NOTE
const updateNote = async (req, res) => {
    try {
        const { noteId } = req.params; // noteId dari params
        const userId = req.user.id; // userId dari middleware verifyToken
        const { noteTitle, noteContent } = req.body; // noteTitle dan noteContent dari req body

        // Cari note berdasarkan noteId dan userId
        const note = await Note.findOne({
            where: { 
                id: noteId,
                userId 
            }
        });

        // Mengembalikan error jika note tidak ditemukan atau user tidak memiliki akses
        if (!note) {
            return res.status(404).json({
                status: "error",
                message: "Note not found or you don't have access"
            });
        }

        // Update note
        const updatedNote = await note.update({
            noteTitle: noteTitle || note.noteTitle, // Jika noteTitle tidak ada di body, gunakan yang lama
            noteContent: noteContent || note.noteContent // Jika noteContent tidak ada di body, gunakan yang lama   
        });

        res.status(200).json({
            status: "success",
            message: "Note updated successfully",
            data: updatedNote
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// DELETE NOTE
const deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params; // noteId dari params
        const userId = req.user.id; // userId dari middleware verifyToken

        // Cari note berdasarkan noteId dan userId
        const note = await Note.findOne({
            where: { 
                id: noteId,
                userId 
            }
        });

        // Mengembalikan error jika note tidak ditemukan atau user tidak memiliki akses
        if (!note) {
            return res.status(404).json({
                status: "error",
                message: "Note not found or you don't have access"
            });
        }

        // Delete note
        await note.destroy();

        res.status(200).json({
            status: "success",
            message: "Note deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

export {
    createNote,
    getNoteById,
    getAllNotes,
    updateNote,
    deleteNote
};