import express = require("express");
import {Request, Response} from "express";

const profileRouter = express.Router();

profileRouter.get('/api/profile', (req: Request, resp: Response) => {
    resp.send('Profile')
});

export default profileRouter;
