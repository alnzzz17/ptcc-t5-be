const express = require("express");
const router = express.Router();
const {
    createNote, 
    getNoteById,
    deleteNote,
    getAllNotes,
    editNote
} = require("../controllers/note");

// create a note
router.post('/note/new', createNote);

// fetch a note by ID
router.get('/note/get/:noteId', getNoteById);

// fetch notes preview
router.get('/note/all', getAllNotes);

// edit a note
router.put('/note/edit/:noteId', editNote);

// delete a note
router.delete('/note/delete/:noteId', deleteNote);

module.exports = router;