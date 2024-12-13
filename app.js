const express = require("express");
const cors = require('cors');
const app = express(); 

// const healthCheck = require('./route/healthCheck.js');
// app.use("/healthcheck", healthCheck);
app.use(express.json());
app.use(cors());
//home route
app.get("/", (req, res) => {
  res.status(200).json({
    message : "🚧 Page Under Construction 🚧 "
  })
})

const userRouter = require("./src/route/userRotuer"); // update
app.use("/api/v1/user", userRouter);


const jobRouter = require("./src/route/jobRotuer");
app.use("/api/v1/job", jobRouter);
module.exports = app;
