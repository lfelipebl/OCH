const productCategory = require('../models/productCategoryModel.js');
const asyncHandler = require('express-async-handler');
const validateDBId = require('../utls/validatedbid.js');

//Crear categoria de producto
const createProductCategory = asyncHandler(async(req, res) => {
    try{
        const newProductCategory = await productCategory.create(req.body);
        res.json(newProductCategory);
    }
    catch(error){
        throw new Error(error);
    }
}); 


//actualizar categoria de producto
const updateProductCategory = asyncHandler(async(req, res) => {
const {id} = req.params;
validateDBId(id);
    try{
        const updateProductCategory = await productCategory.findByIdAndUpdate(id, req.body, { new: true});
        res.json(updateProductCategory);
    }
    catch(error){
        throw new Error(error);
    }
}); 

//Eliminar categoria de producto
const deleteProductCategory = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateDBId(id);
        try{
            const deleteProductCategory = await productCategory.findByIdAndDelete(id);
            res.json(deleteProductCategory);
        }
        catch(error){
            throw new Error(error);
        }
    }); 


//ver categoria de producto
const getProductCategory = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateDBId(id);
    try{
        const getProductCategory = await productCategory.findById(id);
        res.json(getProductCategory);
    }
    catch(error){
        throw new Error(error);
    }
});     


//ver todas categoria de producto
const getAllProductCategory = asyncHandler(async(req, res) => {
    try{
        const getAllProductCategory = await productCategory.find();
        res.json(getAllProductCategory);
    }
    catch(error){
        throw new Error(error);
    }
});  
module.exports = {
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    getProductCategory,
    getAllProductCategory
};