const express = require('express');
require('dotenv').config();
const connectDB = require("./config/db");
const cookieParser=require("cookie-parser");
const cors=require("cors");

const authRouter = require("./routers/authRoutes");
const taskRouter = require("./routers/taskRoutes")

const PORT= process.env.PORT||3000;

const app = express();

// middlewares
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(cors());


// routes
app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);


// connecting to database
connectDB().then(() => {
  console.log("Database connection established...");
  app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
}); 
}).catch(err => {
  console.log("Database cannot be connected!!");
  console.log(err);
});