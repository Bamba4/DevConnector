import express = require("express");
import {Request, Response} from "express";
import UserRouter from "./routes/api/user";
import * as bodyParser from "body-parser";
import db from "./config/db";
import profileRouter from "./routes/api/profile";
import authRouter from "./routes/api/auth";
db;
const app = express();

const  PORT = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/api/users', UserRouter);
app.use('/api/profile/', profileRouter);
app.use('/api/auth', authRouter);
app.listen(PORT , () => {
   console.log(`Server started on port: ${PORT}`)
});

