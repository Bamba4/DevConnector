import express = require("express");
import {Request, Response} from "express";
import auth from "../../middleware/auth";
import Profile from "../../models/Profile.model";
import {check, validationResult} from "express-validator";

const profileRouter = express.Router();

profileRouter.get('/me', auth,
    async (req: any, resp: any) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
        if(!profile) {
            return resp.status(400).json({msg: 'There is no profile for this user'});
        }
        resp.json(profile);

    }catch (e) {
        console.error(e);
        resp.status(500).send('Server Error')
    }
});

// @ts-ignore
profileRouter.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'skills is required').not().isEmpty()
] ], async (req: any, resp: any) => {
        const errors = validationResult(req);
        //build profile project
        const profileFields: any = {};
        profileFields.user = req.user.id;
        if(!errors.isEmpty()) {
            return resp.status(400).json({errors: errors.array()})
        }
        const {
            company, website, location, bio, status, githubusername,
            skills, youtube, facebook, twitter, instagram, linkedin
        } = req.body;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map((skill: any)=> skill.trim());
        }
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (facebook) profileFields.social.facebook = facebook;
        if (twitter) profileFields.social.twitter = twitter;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;
        try {
            let profile = await Profile.findOne({user: profileFields.user});
            if (profile) {
                //update
                profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {new: true});
                return resp.json(profile);
            }
            //Create
            profile = new Profile(profileFields);
            await profile.save();
            return resp.json(profile);
        }catch (e) {
            console.error(e.message);
            resp.status(500).send('Server Error');
        }
});

export default profileRouter;
