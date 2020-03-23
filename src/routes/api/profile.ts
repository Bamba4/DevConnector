import express = require("express");
import auth from "../../middleware/auth";
import Profile from "../../models/Profile.model";
import {check, validationResult} from "express-validator";
import User from "../../models/User.model";

const profileRouter = express.Router();
//@route GET api/profile/me
//@desc  GET profile by user
//@access Private
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
//@route GET api/profile/
//@desc  GET All Profile
//@access Public
profileRouter.get('/', async  (req: any,resp: any) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        resp.json(profiles);
    }catch (e) {
        console.log(e.message);
        resp.status(500).send('Server Error');
    }
});

//@route GET api/profile/user/:user_id
//@desc  GET  Profile by user_id
//@access Public
profileRouter.get('/user/:user_id', async  (req: any,resp: any) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);
        if (!profile) return resp.status(400).json({ msg: 'There is no profile for this user' });
        resp.json(profile);
    }catch (e) {
        console.log(e.message);
        if (e.kind == 'ObjectId') {
            resp.status(400).json({msg: 'Profile not found'});
        }
        resp.status(500).send('Server Error');
    }
});
//@route DELETE api/profile/
//@desc  DELETE profile, user & posts
//@access Private
profileRouter.delete('/', auth, async  (req: any,resp: any) => {
    try {
        //@todo - remove users posts
        //Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        //remove user
        await User.findOneAndRemove({ _id: req.user.id });

        resp.json({ 'msg': 'User deleted' });
    }catch (e) {
        console.log(e.message);
        resp.status(500).send('Server Error');
    }
});
//@route PUT api/profile/experience
//@desc Add profile experience
//@access Private
// @ts-ignore
profileRouter.put('/experience',  [
    auth,
    [
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty()
    ]], async (req: any, resp: any) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return resp.status(400).json({errors: errors.array()})
        }
        const {
            title, company, from, to, location, current,description
        } = req.body;
        const  newExp = {
            title, company, location, from, to, current, description
        };
        try {
            let profile: any  = await Profile.findOne({ user: req.user.id });
            console.log(profile);
            profile.experience = newExp;
            await profile.save();
            resp.json(profile);
        }catch (e) {
            console.error(e.message);
            resp.status(500).send('Server Error');
        }
});
//@route DELETE api/profile/experience/:exp_id
//@desc Delete experience from profile
//@access Private
// @ts-ignore
profileRouter.delete('/experience/:exp_id', auth,
    async (req: any, resp: any) => {
        try{
            // @ts-ignore
            let profile: Profile  = await Profile.findOne({ user: req.user.id });
            //Get remove index
            if (!profile) return resp.status(401).json({msg: 'Profile not Found'});
           let removeIndex = await profile.experience.map((item:any) => item.id).indexOf(req.params.exp_id);
           profile.experience.split(removeIndex, 1);
           console.log(typeof profile.experience);
           await profile.save();
           return resp.json(profile);
        }catch (e) {
            console.error(e.message);
            resp.status(500).json({ msg: 'Server Error' });
        }
    });
//@route PUT api/profile/education
//@desc Add profile education
//@access Private
// @ts-ignore
profileRouter.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Fieldofstudy is required').not().isEmpty()
]], async (req: any, resp: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(400).json({errors: errors.array()});
    }
    let {
        school, degree, fieldofstudy, current, decription
    } = req.body;
    const newEduct = { school, degree, fieldofstudy, current, decription };
    try{
        const profile: any = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEduct);
        profile.save();
        return resp.json(profile);

    }catch (e) {
        console.error(e.message);
        return resp.status(500).json({msg: 'Server Error'});
    }
});
//@route DELETE api/profile/education/:educt_id
//@desc Delete profile education
//@access Private
// @ts-ignore
profileRouter.delete('/education/:educt_id', auth, async (req: any, resp: any) => {
    try{
        const profile: any = Profile.findOne({ user: req.user.id });
        const romoveIndex = profile.education.map((item:any) => item.id).indexOf(req.params.educt_id);
        profile.education.split(romoveIndex, 1);
        await profile.save();
        return resp.json(profile);
    }catch (e) {
        console.error(e.message);
        return resp.status(500).json({msg: 'Server Error'});
    }
});
export default profileRouter;
