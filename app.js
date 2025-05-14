import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
}));

// Handle Preflight (OPTIONS)
app.options('*', cors());

// Import Routers
import userRouter from "./routes/user.js";
import noteRouter from "./routes/note.js";

// Mount Routers
app.use("/api/user", userRouter);
app.use("/api/notes", noteRouter);

// Default route
app.get('/', (req, res) => {
    res.json({ message: "Hello from backend service" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        status: "error",
        message: "Internal Server Error" 
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        status: "error",
        message: "Endpoint not found" 
    });
});

// Database associations and server start
import association from './utils/dbAssoc.js';
const PORT = process.env.PORT || 5000;

association()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Connected to DB and server is running on port ${PORT}`);
            console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5000'}`);
        });
    })
    .catch((err) => {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    });