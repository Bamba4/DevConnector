import express = require("express");
import {Request, Response} from "express";
import UserRouter from "./routes/api/user";
import * as bodyParser from "body-parser";
import db from "./config/db";
import profileRouter from "./routes/api/profile";
import authRouter from "./routes/api/auth";
import postRouter from "./routes/api/post";
import cors from 'cors';
db;
const app = express();

const  PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/api/users', UserRouter);
app.use('/api/profile/', profileRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.listen(PORT , () => {
   console.log(`Server started on port: ${PORT}`)
});

