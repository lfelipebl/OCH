const blogCategory = require('../models/blogCatModel.js');
const asyncHandler = require('express-async-handler');
const validateDBId = require('../utls/validatedbid.js');

//Crear categoria de producto
const createBlogCategory = asyncHandler(async(req, res) => {
    try{
        const newBlogCategory = await blogCategory.create(req.body);
        res.json(newBlogCategory);
    }
    catch(error){
        throw new Error(error);
    }
}); 


//actualizar categoria de producto
const updateBlogCategory = asyncHandler(async(req, res) => {
const {id} = req.params;
validateDBId(id);
    try{
        const updateBlogCategory = await blogCategory.findByIdAndUpdate(id, req.body, { new: true});
        res.json(updateBlogCategory);
    }
    catch(error){
        throw new Error(error);
    }
}); 

//Eliminar categoria de producto
const deleteBlogCategory = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateDBId(id);
        try{
            const deleteBlogCategory = await blogCategory.findByIdAndDelete(id);
            res.json(deleteBlogCategory);
        }
        catch(error){
            throw new Error(error);
        }
    }); 


//ver categoria de producto
const getBlogCategory = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateDBId(id);
    try{
        const getBlogCategory = await blogCategory.findById(id);
        res.json(getBlogCategory);
    }
    catch(error){
        throw new Error(error);
    }
});     


//ver todas categoria de producto
const getAllBlogCategory = asyncHandler(async(req, res) => {
    try{
        const getAllBlogCategory = await blogCategory.find();
        res.json(getAllBlogCategory);
    }
    catch(error){
        throw new Error(error);
    }
});  
module.exports = {
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory,
    getBlogCategory,
    getAllBlogCategory
};