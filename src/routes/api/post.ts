import express = require("express");
import auth from "../../middleware/auth";
import {check, validationResult} from "express-validator";
import User from "../../models/User.model";
import Post from "../../models/Post.model";

const postRouter = express.Router();
//@route POST api/posts
//@desc Create a post
//@access Private
// @ts-ignore
postRouter.post('/', [auth,
    [
        check('text', 'Text is required').not().isEmpty()
    ]], async (req: any, resp: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(400).json({errors: errors.array()})
    }
    try{
        const user: any = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });
        const post = await newPost.save();
        resp.json(post);

    }catch (e) {
        console.error(e.message);
        return resp.status(500).send('Server Error');
    }
});
//@route POST api/posts
//@desc GET All posts
//@access Private
postRouter.get('/', auth, async (req: any, resp: any) => {
   try{
        const posts = await Post.find().sort({ date: -1 }).populate('user', ['name', 'avatar']).
        populate('likes', ['name', 'avatar']);
        if (!posts) {
            return resp.status(400).json({msg: 'Post not found'});
        }
        return resp.json(posts);
   }catch (e) {
       console.error(e.message);
       return resp.status(500).send('Server Error');
   }
});
//@route POST api/posts/post_id
//@desc GET post by id
//@access Private
postRouter.get('/:post_id', auth, async (req:any, resp: any) => {
   try{
       const post = await Post.findById(req.params.post_id).populate('user', ['name', 'avatar']).
       populate('likes', ['name', 'avatar']);
       if (!post) {
           return resp.status(400).json({msg: 'Post not found'});
       }
       return resp.json(post);
   } catch (e) {
       if (e.kind == 'ObjectId')
           return resp.status(400).json({msg: 'Post not found'});
       console.error(e.message);
       return resp.status(500).send('Server Error');
   }
});
//@route DELETE api/posts/post_id
//@desc DELETE post by id
//@access Private
postRouter.delete('/:id', auth, async (req: any, resp: any ) => {
   try{
       // @ts-ignore
       const post: Post = await Post.findById(req.params.id);
       if (post.user.toString() !== req.user.id) {
           return resp.status(400).json({msg: "Unauthorized to delete this post"})
       }
        await post.remove();
       return resp.json({msg: 'Post deleted success'});

   }  catch (e) {
       if (e.kind == 'ObjectId')
           return resp.status(400).json({msg: 'Post not found'});
       console.error(e.message);
       return resp.status(500).send('Server Error');
   }
});
//@route PUT api/posts/likes/:id
//@desc UPDATE post likes by id
//@access Private
postRouter.put('/like/:id', auth, async (req: any, resp: any) => {
   try{
     const post: any = await Post.findById(req.params.id);
     if (post.likes.filter((like:any) => like == req.user.id).length > 0) {
         return resp.status(400).send('Post already liked')
     }
     post.likes.unshift(req.user.id);
     await post.save();
     return resp.json(post);
   } catch (e) {
       console.error(e.message);
       return resp.status(500).send('Server Error');
   }
});
//@route PUT api/posts/likes/:id
//@desc UPDATE post likes by id
//@access Private
postRouter.put('/unlike/:id', auth, async (req: any, resp: any) => {
    try{
        const post: any = await Post.findById(req.params.id);
        if (post.likes.filter((like:any) => like == req.user.id).length === 0) {
            return resp.status(400).send('Post has not yet been liked')
        }
        //GET remove index
        const removeIndex = post.likes.map((like: any) => like.toString() === req.user.id);
        post.likes.splice(removeIndex, 1);
        await post.save();
        return resp.json(post);
    } catch (e) {
        console.error(e.message);
        return resp.status(500).send('Server Error');
    }
});
//@route POST api/posts/comments/:id
//@desc ADD comment to the post
//@access Private
// @ts-ignore
postRouter.put('/comments/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req: any, resp: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        resp.status(400).json({errors: errors.array()})
    }
    try {
        const user: any = await User.findById(req.user.id);
        const post: any = await Post.findById(req.params.id);
        if (!post)
            return resp.status(400).send('Post not found');
        const newComment = {
            name: user.name,
            user: req.user.id,
            text: req.body.text,
            avatar: user.avatar
        };
        post.comments.unshift(newComment);
        await post.save();
        return resp.json(post);
    }catch (e) {
        if (e.kind == 'ObjectId')
            resp.status(400).send('Post not found');
        console.error(e.message);
        return resp.status(500).send('Server Error');
    }
});
//@route POST api/posts/comments/:id
//@desc ADD comment to the post
//@access Private
// @ts-ignore
postRouter.delete('/:id/comments/:comment_id', auth, async (req: any, resp: any) => {
   try{
       const post:any = await Post.findById(req.params.id);
       const removeIndex = await post.comments.map((item: any) => item.id).indexOf(req.params.comment_id);
       post.comments.splice(removeIndex, 1);
       post.save();
       return resp.json(post);
   } catch (e) {
       if (e.kind == 'ObjectId')
           resp.status(400).send('Post not found');
       console.error(e.message);
       return resp.status(500).send('Server Error');
   }
});

export default postRouter;
