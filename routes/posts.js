const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

//list
router.get('/',async (req, res)=> {
    try{
        const posts = await Post.find();
        res.json(posts);
    }catch(err){
        res.json({message : err});
    }
});

// specific post
router.get('/:postId', async (req,res)=>{
    try{
    const post = await Post.findById(req.params.postId);
    res.json(post);
    }catch(err){
        res.json({message:err});
    }
});
// add
router.post('/', async (req, res)=>{
    const post = new Post({
        kode: req.body.kode,
        nama: req.body.nama,
        harga: req.body.harga,
        stok: req.body.stok
    });
   
    try{
        const savedPost = await post.save();
        res.json(savedPost);
    }
    catch(err){
        res.json({message: err});
    }
});
//delete
router.delete('/:postId', async(req,res)=>{
    try{
    const removedPost = await Post.remove({_id:req.params.postId});
    res.json(removedPost);
    }catch(err){
        res.json({message:err});
    }
});

//update
router.patch('/:postId', async(req,res)=>{
    try{
        const updatedPost = await Post.updateOne(
            {_id:req.params.postId},
            {$set:{kode:req.body.kode,
                nama: req.body.nama,
                harga: req.body.harga,
                stok: req.body.stok}}
        );
        res.json(updatedPost);
    }catch(err){
        res.json({message:err});
    }
})
module.exports=router;