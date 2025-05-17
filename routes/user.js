import express from 'express';
const router = express.Router();
import verifyToken from '../middlewares/verifyToken.js';
import refreshToken from "../controllers/refreshToken.js";
import {
    postUser,
    deleteUser,
    loginHandler,
    editUser,
    logoutHandler
} from '../controllers/user.js';

// ENDPOINT TOKEN REFRESH
router.get('/refresh', refreshToken);

// REGISTER NEW USER
router.post('/register', postUser);

// USER LOGIN
router.post('/login', loginHandler);

// USER LOGOUT
router.post('/logout', verifyToken, logoutHandler);

// DELETE USER ACCOUNT
router.delete('/delete/:id', verifyToken, deleteUser);

// EDIT USER ACCOUNT
router.put('/edit', verifyToken, editUser);

export default router;