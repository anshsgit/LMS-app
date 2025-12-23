const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/user");
const instructorRoutes = require("./routes/instructor");
const cookieParser = require('cookie-parser');
const { connectDB } = require("./utils/connectDB");
const port = 3000;

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/account", accountRoutes);
app.use("/instructor", instructorRoutes);

app.listen(port, () => {
    console.log("App is listening on port: ", port);
});