import express = require("express");
import {Request, Response} from "express";

const app = express();

const  PORT = process.env.PORT || 5000;
app.get('/', (req: Request, resp: Response) => {
   resp.send("API RUNING")
});

app.listen(PORT , () => {
   console.log(`Server started on port: ${PORT}`)
});

