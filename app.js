const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

//import router
const userRouter = require("./routes/user");
const noteRouter = require("./routes/note");

//middleware untuk parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// user router
app.use(userRouter);
// note router
app.use(noteRouter);

// konfigurasi CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// default route
app.get("/", (req, res, next) => {
  try {
    res.json({
      message: "Hello from another service"
    });
  } catch (error) {
    console.log(error);
  }
});

// dbAssoc.js
const association = require('./utils/dbAssoc');

const port = process.env.PORT;

association()
  .then(() => {
    app.listen(port, () => {
      console.log('connected to db and server is running on port', port);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });

  // serve static files dari folder client
app.use(express.static(path.join(__dirname, '../client')));

// route untuk halaman login
app.get('/user/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/pages/login.html'));
});