const Blog = require('../models/blogModel.js');
const User = require('../models/userModel.js');
const asyncHandler = require('express-async-handler');
const validateDBId = require('../utls/validatedbid.js');
const cloudinaryUploadImg = require('../utls/cloudinary.js');
const fs = require('fs');


// Crear Blog
const createBlog = asyncHandler(async(req, res) => {
    try{
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);
    }catch(error){
        throw new Error(error);

    }
});


//Actualizar blog
const updateBlog = asyncHandler(async(req, res) => {
    const {id}  = req.params;
    validateDBId(id);
    try{
        const updateBlog = await Blog.findByIdAndUpdate(id,req.body,{ new: true});
        res.json(updateBlog);
    }catch(error){
        throw new Error(error);

    }
});


//Ver blog
const getBlog = asyncHandler(async(req, res) => {
    const {id}  = req.params;
    validateDBId(id);
    try{
        const getBlog = await Blog.findById(id).populate('likes').populate('dislikes');
        const updateViews = await Blog.findByIdAndUpdate(id, {
            $inc: {numViews: 1},
        },
        {new: true});
        res.json(getBlog);
    }catch(error){
        throw new Error(error);
    }
});


//Ver todos los blogs
const getAllBlogs = asyncHandler(async(req, res) => {
    try{
        const getBlogs = await Blog.find();
        res.json(getBlogs);
    }catch(error){
        throw new Error(error);
    }
});


//Eliminar
const deleteBlog = asyncHandler(async(req, res) => {
    const {id}  = req.params;
    validateDBId(id);
    try{
        const delBlog = await Blog.findByIdAndDelete(id);
        res.json(delBlog);
    }catch(error){
        throw new Error(error);
    }
});

//Like Blog

const likeBlog = asyncHandler(async(req, res) => {
    const {blogId} = req.body;
    validateDBId(blogId);

    // Find the blog which you awant to be liked
    const blog = await Blog.findById(blogId);

    // Find login user
    const loginUserId = req?.user?._id;

    // Find if the user has liked the blog
    const isLiked = blog?.isLiked;

    //Find if the user has disliked the blog
    const alreadyDisliked = blog?.dislikes?.find(userId => userId.toString()=== loginUserId?.toString());

    if(alreadyDisliked){
        const blog = await Blog.findByIdAndUpdate(blogId, 
            {
                $pull: {dislikes: loginUserId},
                isDisLiked: false,
            },{new: true});
            res.json(blog);
    }

    if(isLiked){
        const blog = await Blog.findByIdAndUpdate(blogId, 
            {
                $pull: {likes: loginUserId},
                isLiked: false,},
            {new: true});
            res.json(blog);
    }

    else {
        const blog = await Blog.findByIdAndUpdate(blogId, 
            {
                $push: {likes: loginUserId},
                isLiked: true,

            },{new: true});
            res.json(blog);
    }
});

//Dislike Blog
const dislikeBlog = asyncHandler(async(req, res) => {
    const {blogId} = req.body;
    validateDBId(blogId);

    // Find the blog which you awant to be liked
    const blog = await Blog.findById(blogId);

    // Find login user
    const loginUserId = req?.user?._id;

    // Find if the user has liked the blog
    const isdisLiked = blog?.isDisLiked;

    //Find if the user has disliked the blog
    const alreadyLiked = blog?.likes?.find(userId => userId.toString()=== loginUserId?.toString());

    if(alreadyLiked){
        const blog = await Blog.findByIdAndUpdate(blogId, 
            {
                $pull: {dislikes: loginUserId},
                isDisLiked: false,
            },{new: true});
            res.json(blog);
    }

    if(isdisLiked){
        const blog = await Blog.findByIdAndUpdate(blogId, 
            {
                $pull: {dislikes: loginUserId},
                isDisLiked: false,},
            {new: true});
            res.json(blog);
    }

    else {
        const blog = await Blog.findByIdAndUpdate(blogId, 
            {
                $push: {dislikes: loginUserId},
                isDisLiked: true,

            },{new: true});
            res.json(blog);
    }
});

const uploadImages = asyncHandler(async(req,res) => {
    const { id } = req.params;
    validateDBId(id);
    try{
        const uploader = (path) => cloudinaryUploadImg(path,'images');
        const urls = [];
        const files = req.files;
        for (const file of files){
            const { path } = file;
            const newpath = await uploader(path);
            urls.push(newpath);
            fs.unlinkSync(path);
        }
        const findBlog = await Blog.findByIdAndUpdate(id,{
            images: urls.map((file) => {
                return file;
            }),    
        },{
            new: true,
        }); 
        res.json(findBlog); 
    }
    catch(error){throw new Error(error);
    }
});


module.exports = { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, dislikeBlog, uploadImages  };