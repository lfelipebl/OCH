const Product = require ('../models/productModel.js');
const User = require('../models/userModel.js');
const asyncHandler = require ('express-async-handler');
const slugify = require ('slugify');
const validateDBId = require('../utls/validatedbid.js');
const cloudinaryUploadImg = require('../utls/cloudinary.js');
const fs = require('fs');

//Crear producto
const crateProduct = asyncHandler(async(req, res) => {
    try{
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);}
        const newProduct = await Product.create(req.body);
        res.json({  message:"Producto creado correctamente",
                    newProduct,});
    }catch(error){
        throw new Error(`EP1 Error creando producto: ${error}`);
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
        throw new Error(`EP2 Error obteniendo producto: ${error}`);
    }
});


//Obtener todos los productos

const getAllProduct = asyncHandler(async(req, res) => {
    
    try{
        
        //filtering

        const queryObj = {...req.query};
        const excludeFiedls = ['page','sort','limit','fields'];
        excludeFiedls.forEach(element => delete queryObj[element]);
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

        query = query.skip(skip).limit(limit);

        if(req.query.page){
            const productCount = await Product.countDocuments();
            if(skip >= productCount) throw new Error('Ths page does not exists');
        }

        const product = await query;
        res.json( product);
    }catch(error){
        throw new Error(`EP3 Error obteniendo todos los productos: ${error}`);
    }
});


//Actualizar productos

const updateProduct = asyncHandler( async (req, res)=>{

    const id = req.Product;
    validateDBId(id);
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
        throw new Error(`EP4 Error actualizando producto: ${error}`);
 }
});


//Eliminar productos

const deleteProduct = asyncHandler( async (req, res)=>{

    const id = req.Product; // FALLA 1: Validar si es Product o params(así está)
    validateDBId(id);
    try{
        const delProduct = await Product.findOneAndDelete(id);
        res.json({
            message: "Producto eliminado",
            delProduct})
    }
    catch(error){
        throw new Error(`EP5 Error eliminando producto: ${error}`);
 }
});


//

const addToWishlist = asyncHandler(async(req,res) => {
    const { _id } = req.user;
    const { prodId } = req.body;

    try{
        const user = await User.findById(_id);
        const alreadyadded = user.wishlist.find((id)=>id.toString() === prodId); 
        if(alreadyadded){
            let user = await User.findByIdAndUpdate(_id, 
                {$pull: { wishlist: prodId},
            },{
                new:true,
            });
            res.json(user);
        }else{
            let user = await User.findByIdAndUpdate(_id, 
                {$push: { wishlist: prodId},
            },{
                new:true,
            });
            res.json(user);
        }
    }catch(error){throw new Error(`EP6 Error wishlist product: ${error}`)};
});



//RATING

const rating = asyncHandler(async(req, res) => {
   const { _id } = req.user;
   const { star, prodId, comment} = req.body;
  
   try {

    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find((userId) => userId.postedby.toString() === _id.toString());

    if (alreadyRated) {
        const updateRating = await Product.updateOne({
            ratings: { $elemMatch: alreadyRated }
        },{
            $set: {"ratings.$.star":star,
                   "ratings.$.comment":comment}
        }, {
            new: true,
        });
    }else { 
        const rateProduct = await Product.findByIdAndUpdate(prodId,{
            $push: { 
                ratings: {
                    star: star,
                    comment: comment,
                    postedby: _id,
                }
            }
        },{
            new: true,
        });
    }
    //TotalRatings
    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingSum = getallratings.ratings
        .map((item) => item.star)
        .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingSum / totalRating);
    let finalrating = await Product.findByIdAndUpdate(prodId, {
                            totalratings: actualRating,},{new: true,});
    res.json(finalrating);
   }
   catch(error){ throw new Error (error)}
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
        const findProduct = await Product.findByIdAndUpdate(id,{
            images: urls.map((file) => {
                return file;
            }),    
        },{
            new: true,
        }); 
        res.json(findProduct); 
    }
    catch(error){throw new Error(error);
    }
});



module.exports = {
    crateProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    uploadImages
};
