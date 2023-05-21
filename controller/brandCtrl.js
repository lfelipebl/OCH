const Brand = require('../models/brandModel.js');
const asyncHandler = require('express-async-handler');
const validateDBId = require('../utls/validatedbid.js');

//Crear categoria de producto
const createBrand = asyncHandler(async(req, res) => {
    try{
        const newBrand = await Brand.create(req.body);
        res.json(newBrand);
    }
    catch(error){
        throw new Error(error);
    }
}); 


//actualizar categoria de producto
const updateBrand = asyncHandler(async(req, res) => {
const {id} = req.params;
validateDBId(id);
    try{
        const updateBrand = await Brand.findByIdAndUpdate(id, req.body, { new: true});
        res.json(updateBrand);
    }
    catch(error){
        throw new Error(error);
    }
}); 

//Eliminar categoria de producto
const deleteBrand = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateDBId(id);
        try{
            const deleteBrand = await Brand.findByIdAndDelete(id);
            res.json(deleteBrand);
        }
        catch(error){
            throw new Error(error);
        }
    }); 


//ver categoria de producto
const getBrand = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateDBId(id);
    try{
        const getBrand = await Brand.findById(id);
        res.json(getBrand);
    }
    catch(error){
        throw new Error(error);
    }
});     


//ver todas categoria de producto
const getAllBrand = asyncHandler(async(req, res) => {
    try{
        const getAllBrand = await Brand.find();
        res.json(getAllBrand);
    }
    catch(error){
        throw new Error(error);
    }
});  
module.exports = {
    createBrand,
    updateBrand,
    deleteBrand,
    getBrand,
    getAllBrand
};