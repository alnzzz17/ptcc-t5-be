const express = require("express");
const router = express.Router();
const {
    postUser,
    deleteUser,
    loginHandler,
    editUser
} = require("../controllers/user");

// REGISTER NEW USER (EVERYBODY CAN SIGN UP)
router.post('/user/register', postUser);

// USER LOGIN
router.post('/user/login', loginHandler);

// DELETE USER ACCOUNT
router.delete('/user/delete/:id', deleteUser);

// EDIT USER ACCOUNT
router.put('/user/edit/', editUser);

module.exports = router;
