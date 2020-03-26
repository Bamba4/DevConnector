import express = require("express");
import {Request, Response} from "express";
import auth from '../../middleware/auth'
import User from "../../models/User.model";
import {check, validationResult} from "express-validator/check";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const authRouter = express.Router();

authRouter.get('/me', auth , async (req: any, resp: any) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        console.log(req.user.id);
        resp.json(user);
    }catch (e) {
        console.error(e.message);
        resp.status(500).send('Server Error');
    }
});

authRouter.post('/', [
        check('email', 'Email n\'est pas valide').isEmail(),
        check('password', 'Le mot de passe est obligatoire').exists()
    ], async (req: Request, resp: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            resp.status(400).send(errors);
        }
        let  {email, password} = req.body;
        try{
            let user:any = await User.findOne({email});
            if (!user) {
                resp.status(400).json({errors: [{msg: 'Invalid credentials'}]})
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                resp.status(400).json({errors: [{msg: 'User or password invalid'}]})

            }
            const payload = {
                user: {
                    id: user.id
                }
            };
            jwt.sign(
                payload,
                "secretToken",
                {expiresIn: 360000},
                (error, token) => {
                    if (error) throw error;
                    resp.json({token})
                }
            )
        }catch (e) {
            console.error(e);
            resp.status(500).send('Server Error')
        }
    }
);
export default authRouter;
