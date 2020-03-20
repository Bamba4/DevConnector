import express = require("express");
import {Request, Response} from "express";

const postRouter = express.Router();

postRouter.get('/api/profile', (req: Request, resp: Response) => {
    resp.send('post')
});

export default postRouter;
