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

// CREATE NEW NOTE
router.post('/new', verifyToken, createNote);

// GET ALL NOTES BY USER
router.get('/all', verifyToken, getAllNotes);

// GET NOTE BY ID
router.get('/:noteId', verifyToken, getNoteById);

// UPDATE NOTE
router.put('/:noteId', verifyToken, updateNote);

// DELETE NOTE
router.delete('/:noteId', verifyToken, deleteNote);

export default router;