const { json } = require('body-parser');
const Product = require ('../models/productModel.js');
const asyncHandler = require ('express-async-handler');
const slugify = require ('slugify');

//Crear producto
const crateProduct = asyncHandler(async(req, res) => {

    try{
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }

        const newProduct = await Product.create(req.body);
        res.json({  message:"Producto creado correctamente",
                    newProduct, 
        });

    }catch(error){
        throw new Error(`Error creando producto: ${error}`);
    }  
});


// Obtener producto

const getaProduct = asyncHandler(async(req, res) => {
    const { id } = req.params; 
    try{
        const findProduct = await Product.findById(id);
            res.json({  message:"Producto obtenido correctamente",
                        findProduct,
                });
    }catch(error){
        throw new Error(`Error obteniendo producto: ${error}`);
    }
});


//Obtener todos los productos

const getAllProduct = asyncHandler(async(req, res) => {
    
    try{
        
        //filtering

        const queryObj = {...req.query};
        const excludeFiedls = ['page','sort','limit','fields'];
        excludeFiedls.forEach(element => delete queryObj[element]);
        console.log(queryObj);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match =>`$${match}`);
        let query = Product.find(JSON.parse(queryStr));



        //sorting  -> Clasificación

        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }else {
            query = query.sort('-createdAt');
        }


        // limiting the fields, limitando por campos

        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        }else {
            query = query.select('-__v');
        }

        // pagination

        const page = req.query.page;
        const  limit = req.query.limit;
        const skip = (page -1) * limit;
        console.log(page, limit, skip);

        query = query.skip(skip).limit(limit);

        if(req.query.page){
            const productCount = await Product.countDocuments();
            if(skip >= productCount) throw new Error('Ths page does not exists');
        }

        const product = await query;
        res.json( product);
    }catch(error){
        throw new Error(`Error obteniendo todos los productos: ${error}`);
    }
});


//Actualizar productos

const updateProduct = asyncHandler( async (req, res)=>{

    const id = req.Product;
    try{
        if(req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const updateProd = await Product.findOneAndUpdate({id}, req.body, {new: true});
        res.json({
            message: "Producto actualizado",
            updateProd});
    }
    catch(error){
        throw new Error(error);
 }
});


//Eliminar productos

const deleteProduct = asyncHandler( async (req, res)=>{

    const id = req.Product;
    try{
        const delProduct = await Product.findOneAndDelete(id);
        res.json({
            message: "Producto eliminado",
            delProduct})
    }
    catch(error){
        throw new Error(error);
 }
});


//Filtar productos
/*
const filterProduct = asyncHandler(async(req, res) => {
    const { minprice, maxprice, color, category, availablity, brand }= req.params;
    console.log(req.query);
    
    try{
        const filterProd = await Product.find({
            price: {
                $gte: minprice,
                $lte: maxprice,
            },
            category,
            brand,
            color,
        });
        res.json(filterProd);
    } catch(error){
        res.json(error);
    }

    res.json({minprice, maxprice, color, category, availablity, brand});
});
*/
module.exports = {crateProduct, getaProduct, getAllProduct, updateProduct, deleteProduct};