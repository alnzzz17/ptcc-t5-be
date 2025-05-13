import Note from "../models/Note.js";
import User from "../models/User.js";

// NEW NOTE
const createNote = async (req, res) => {
    try {
        const { noteTitle, noteContent } = req.body;
        const userId = req.user.id; // From verifyToken middleware

        // Validate required fields
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
        const { noteId } = req.params;
        const userId = req.user.id;

        // Find note with user verification
        const note = await Note.findOne({
            where: { 
                id: noteId,
                userId 
            },
            include: [{
                model: User,
                attributes: ['id', 'username']
            }],
            attributes: ['id', 'noteTitle', 'noteContent', 'createdAt', 'updatedAt']
        });

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

// GET ALL NOTES FOR USER
const getAllNotes = async (req, res) => {
    try {
        const userId = req.user.id;

        const notes = await Note.findAll({
            where: { userId },
            include: [{
                model: User,
                attributes: ['id', 'username']
            }],
            attributes: ['id', 'noteTitle', 'createdAt'],
            order: [['createdAt', 'DESC']]
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
        const { noteId } = req.params;
        const userId = req.user.id;
        const { noteTitle, noteContent } = req.body;

        // Find the note
        const note = await Note.findOne({
            where: { 
                id: noteId,
                userId 
            }
        });

        if (!note) {
            return res.status(404).json({
                status: "error",
                message: "Note not found or you don't have access"
            });
        }

        // Update note
        const updatedNote = await note.update({
            noteTitle: noteTitle || note.noteTitle,
            noteContent: noteContent || note.noteContent
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
        const { noteId } = req.params;
        const userId = req.user.id;

        // Find the note
        const note = await Note.findOne({
            where: { 
                id: noteId,
                userId 
            }
        });

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