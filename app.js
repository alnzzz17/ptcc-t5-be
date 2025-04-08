const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routers
const userRouter = require("./routes/user");
const noteRouter = require("./routes/note");

// Routes
app.use(userRouter);
app.use(noteRouter);

// Default root route
app.get('/', (req, res) => {
  res.json({ message: "Hello from backend service" });
});

// Database associations
const association = require('./utils/dbAssoc');

// Start server
const PORT = process.env.PORT || 5000;

association()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Connected to DB and server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
  });
