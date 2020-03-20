import express = require("express");
import {check, validationResult} from "express-validator";
import {Request, Response} from "express";
import User from "../../models/User.model";
import gravatar from 'gravatar';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const UserRouter = express.Router();

UserRouter.post('/', [
    check('name', 'Name est obligatoire').not().isEmpty(),
    check('email', 'Email n\'est pas valide').isEmail(),
    check('password', 'Password doit contenir au moins 6 caractéres').isLength({min: 6})
    ], async (req: Request, resp: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                resp.status(400).send(errors);
            }
            let  {name, email, password} = req.body;
            try{
                let user = await User.findOne({email});
                if (user) {
                    resp.status(400).json({errors: [{msg: 'ce utilisateur existe dejas'}]})
                }
                const avatar = gravatar.url(email, {
                    s: '200',
                    r: 'png',
                    d: 'mm'
                });
                user = new User({
                   name, email,password, avatar
                });
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
                await user.save();
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

export default UserRouter;
