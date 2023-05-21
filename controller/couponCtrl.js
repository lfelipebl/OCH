const Coupon = require("../models/couponModel.js");
const validateDBId = require('../utls/validatedbid.js');
const asyncHandler = require ('express-async-handler');

//Crear cupon
const createCoupon = asyncHandler(async(req,res) =>{
    try{
        const newCoupon = await Coupon.create(req.body);
        res.json(newCoupon);
    }
    catch(error){
         throw new Error(error)
        }
});


//get all
const getAllCoupons = asyncHandler(async(req,res) =>{
    try{
        const coupons = await Coupon.find();
        res.json(coupons);
    }
    catch(error){
         throw new Error(error)
        }
});

//get a coupon
const getCoupon = asyncHandler(async(req,res) =>{
    const { id } = req.params;
    validateDBId(id);

    try{
        const coupon = await Coupon.findById(id);
        res.json(coupon);
    }
    catch(error){
         throw new Error(error)
        }
});

//Update Coupon
const updateCoupon = asyncHandler(async(req,res) =>{
    const { id } = req.params;
    validateDBId(id);

    try{
        const upCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new:true });
        res.json(upCoupon);
    }
    catch(error){
         throw new Error(error)
        }
});


//Delete Coupon
const deleteCoupon = asyncHandler(async(req,res) =>{
    const { id } = req.params;
    validateDBId(id);

    try{
        const delCoupon = await Coupon.findByIdAndDelete(id);
        res.json(delCoupon);
    }
    catch(error){
         throw new Error(error)
        }
});


module.exports = {createCoupon, getAllCoupons, getCoupon, updateCoupon, deleteCoupon};