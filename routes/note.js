import express from 'express';
const router = express.Router();
import verifyToken from '../middlewares/verifyToken.js';

import {
    createNote,
    getNoteById,
    deleteNote,
    getAllNotes,
    updateNote
} from '../controllers/note.js';

// CREATE NEW NOTE (protected)
router.post('/new', verifyToken, createNote);

// GET ALL NOTES FOR USER (protected)
router.get('/all', verifyToken, getAllNotes);

// GET NOTE BY ID (protected)
router.get('/:noteId', verifyToken, getNoteById);

// UPDATE NOTE (protected)
router.put('/:noteId', verifyToken, updateNote);

// DELETE NOTE (protected)
router.delete('/:noteId', verifyToken, deleteNote);

export default router;