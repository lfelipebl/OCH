const { generateToken } = require('../config/jwtToken.js');
const User = require('../models/userModel.js');
const Product = require('../models/productModel.js');
const Cart = require('../models/cartModel.js');
const Coupon = require('../models/couponModel.js');
const Order = require('../models/orderModel.js');
const uniquid = require('uniquid');
const asyncHandler = require('express-async-handler');
const validateDBId = require('../utls/validatedbid.js');
const { generateRefreshToken } = require('../config/refreshToken.js');
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');
const sendEmail = require('./emailCtrl.js');
const crypto = require('crypto');
const { error } = require('console');


//Crear usuario
const createUser = asyncHandler(async (req,res) => {
    const email = req.body.email;
    const findUser = await User.findOne({email: email});
    
    if (!findUser) {
        // Crete new user
        const newUser = await User.create(req.body);
        res.json(newUser);
    }
    else {
        // User already exists
       throw new Error('Ya existe el usuario');
    }
});


//Login user
const loginUserCtrl=asyncHandler(async(req,res)=>{
    const {email, password}= req.body;
    // chequear si el usuario existe o no
    const findUser = await User.findOne({email});

    if (findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateuser = await User.findByIdAndUpdate(findUser.id,
            {
                refreshToken: refreshToken,
            },
            { new: true}
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,    
        });
        res.json({
            _id: findUser?._id,
            firstname:findUser?.firstname,
            email:findUser?.email,
            token:generateToken(findUser?._id),
        });

    } else {
        throw new Error("Credenciales no existen o son incorrectas");
    }
});


//Admin loggin
const loginAdmin = asyncHandler(async(req,res)=>{
    const {email, password}= req.body;
    // chequear si el usuario existe o no
    const findAdmin = await User.findOne({email});
    if (findAdmin.role !== 'admin') throw new Error ('Not Authorised');
    if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateuser = await User.findByIdAndUpdate(findAdmin.id,
            {
                refreshToken: refreshToken,
            },
            { new: true}
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,    
        });
        res.json({
            _id: findAdmin?._id,
            firstname:findAdmin?.firstname,
            email:findAdmin?.email,
            token:generateToken(findAdmin?._id),
        });

    } else {
        throw new Error("Credenciales no existen o son incorrectas");
    }
});
// handler refresh token

const  handlerRefreshToken = asyncHandler(async(req, res) =>{
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error('No refresh token in Cookies'); 
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if(!user) throw new Error ('No refresh token present in db or not matched');
    jwt.verify(refreshToken, process.env.JWT_SECRET,(err,decoded) =>{
        if(err || user.id !== decoded.id) {
            throw new Error('There is someting worng eith refresh token');
        }
        const accessToken = generateToken(user?._id);
        res.json({accessToken});
    });
});
 
// LogOut user

const logout = asyncHandler(async(req,res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error('No refresh token in Cookies'); 
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user){
        res.clearCookie('refreshToken',{
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204);// forbidden 
    }
    await User.findOneAndUpdate(refreshToken,{
        refreshToken: '',
    });
    res.clearCookie('refreshToken',{
        httpOnly: true,
        secure: true,
    });
    return res.sendStatus(204);
}); 


// save user addres

const saveAddress = asyncHandler(async(req, res, next) => {
    const {_id} = req.user;
    validateDBId(_id);
    try{
        const addressUser = await User.findByIdAndUpdate(_id, {
            address: req?.body?.address,
        },{
            new: true,
        }
        );
        res.json(addressUser);
    }
    catch(error){
        throw new Error(`ERROR saveaddres a usuario: ${error}`);
    }
});



// GET all users

const getAllUser = asyncHandler(async(req,res) => {
    try{
        const getUsers = await User.find();
        res.json(getUsers);
    }catch(error){
        throw new Error(`ERROR consultado todos los usuarios: ${error}`);
    }
})

// GET a single user

const getAUser = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateDBId(id);
    try{
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        });
    }
    catch(error){
        throw new Error(`ERROR consultado a usuario: ${error}`);
    }
});

// DELETE a single user

const deleteAUser = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateDBId(id);
    try{
        const deletedUser = await User.findByIdAndDelete(id);
        res.json({
            deletedUser,
        });
    }
    catch(error){
        throw new Error(`ERROR consultado a usuario: ${error}`);
    }
});

// update a single user

const updateAUser = asyncHandler(async(req,res) =>{
    const {_id} = req.user;
    validateDBId(_id);
    try{
        const updatedUser = await User.findByIdAndUpdate(_id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
        },{
            new: true,
        }
        );
        res.json(updatedUser);
    }
    catch(error){
        throw new Error(`ERROR actualizando a usuario: ${error}`);
    } 
});


//Block/unblock user
const blockUser = asyncHandler(async(req,res) => {
    const {id} = req.params;
    validateDBId(id);
    try{
        const blockuser = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new:true,
            }
        );
        res.json(blockuser);
    }
    catch(error){
        throw new Error(error);
    }
});


const unblockUser = asyncHandler(async(req,res) => {
    const {id} = req.params;
    validateDBId(id);
    try{
        const unblock = await User.findByIdAndUpdate(
            id, {
            isBlocked: false,
            },
            {
            new:true,
            }
        );
        res.json({
            message: "User Unblocked",
        })
    }
    catch(error){
        throw new Error(error);
    }
});



// Upadte password
const  updatePassword = asyncHandler(async(req,res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateDBId( _id );
    const user = await User.findById( _id );
   
    if( password ) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }
});


const forgotPasswordToken = asyncHandler(async (req,res) =>{
    const {email} = req.body;
    const user = await User.findOne({ email });

    if(!user) throw new Error('Usuario no encontrado');
    try{
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hola, por favor da click en el enlace para restablecer la contraseña. El enlace es valido durante 10 minutos, a partir de ahora.
                          <a href='http://127.0.0.1:5000/och/user/reset-password/${token}'>Restablecer contraseña</>`
        
        const data = {
            to: email,
            text: "Hola, Usuario:",
            subject: "Enlace para restablecer contraseña - OCHELARI",
            html: resetURL,
        };

        sendEmail(data);
        res.json(token);
    }catch(error){
        throw new Error(error);
    }
});

const resetPassword = asyncHandler(async (req, res)=> {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now()},
    });

    if(!user) throw new Error(' Token expired, please try again later');
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetToken = undefined;
    await user.save();
    res.json(user);
});


// Get Wishlist
const getWishList = asyncHandler(async(req,res)=>{
    const { _id } = req.user;
    try{
        const findUser = await User.findById(_id).populate('wishlist');
        res.json(findUser);
    }
    catch(error){ throw new Error(error);}
});


// Cart funcionalidad
const userCart = asyncHandler(async(req,res) =>{
    const { cart } = req.body;
    const { _id } = req.user;
    validateDBId(_id);
    try{
        let products = [];
        const user = await User.findById(_id);
        //check if user already have products in cart
        const alreadyExistCarrt = await Cart.findOne({ orderby:user._id });
        if(alreadyExistCarrt) {
            alreadyExistCarrt.remove();
        }
        for (let i = 0; i<cart.length; i++){
            let object={};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select('price').exec();
            object.price = getPrice.price;
            products.push(object)
        }
        
        let cartTotal = 0;
        for(let i=0; i<products.length; i++){
            cartTotal = cartTotal + products[i].price * products[i].count;
        }
        let newCart = await new Cart({
            products,
            cartTotal,
            orderby: user?._id,
        }).save();
        res.json(newCart);
    }
    catch(error){throw new Error(error);};
});

const getUserCart = asyncHandler(async(req,res) => {
    const { _id } = req.user;
    validateDBId( _id );
    try{
        const cart = await Cart.findOne({orderby: _id}).populate('products.product');
        res.json(cart);

    }catch (error) {throw new Error(error)};
});


const emptyCart = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateDBId( _id );
    try{
        const user = await User.findOne({ _id });
        const cart = await Cart.findOneAndRemove({ orderby: user._id}); 
        res.json(cart);
    }catch (error) {throw new Error(error)};
});

const applyCoupon = asyncHandler(async(req,res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateDBId( _id );
    const validCoupon = await Coupon.findOne({ name: coupon});
    if(validCoupon === null){
        throw new Error("Invalid coupon");
    }

    const user = await User.findOne({ _id });
    let { products, cartTotal } = await Cart.findOne({orderby: user._id}).populate('products.product');
    let  totalAfterDiscount  = (cartTotal - (cartTotal * validCoupon.discount)/100).toFixed(2);
    await Cart.findOneAndUpdate(
        {orderby: user._id},
        {totalAfterDiscount},
        {new: true}
        );
        res.json(totalAfterDiscount);
});

const createOrder = asyncHandler(async(req,res) => {
    const { COD, couponApplied} = req.body;
    if(!COD) throw new Error("Create cash order failed");
    const { _id } = req.user;
    validateDBId( _id );
    try{
        const user = await User.findById(_id);
        let userCart = await Cart.findOne({orderby: user._id});
        let finalAmount = 0;
        if(couponApplied && userCart.totalAfterDiscount){
            finalAmount = userCart.totalAfterDiscount;
        }else{
            finalAmount = userCart.cartTotal;
        }
        let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniquid(),
                method: "COD",
                amount: finalAmount,
                status: "Cash on Delivery",
                created: Date.now(),
                currency: "COP"
            },
            orderby: user._id,
            orderStatus: "Cash on Delivery",
        }).save();
        let update = userCart.products.map((item) => {
            return{
                updateOne: {
                    filter: { _id: item.product._id },
                    update:{$inc: {quantity: -item.count, sold: +item.count}},
                },
            };
        }); 

        const updated = await Product.bulkWrite(update, {});
        res.json({ message: "success" });
    }catch(error){ throw new Error(error); }
});

const getOrders = asyncHandler(async(req,res) => {
    const { _id } = req.user;
    validateDBId( _id );
    try{
        const userOrders = await Order.findOne({orderby: _id }).populate("products.product").exec();
        res.json(userOrders);
    }catch(error) {throw new Error(error);}
});

const updateOrderStatus = asyncHandler(async(req,res) => {
    const { status } = req.body;
    const {id} = req.params;
    validateDBId(id);

   try{
    const updateOrderStatus = await Order.findByIdAndUpdate(id,{
        orderStatus: status,
        paymentIntent: {
            status: status,
        }
    },{new: true});
    res.json(updateOrderStatus);
    
   }catch(error){throw new Error(error)};
});

module.exports = {
    createUser,
    loginUserCtrl,
    getAllUser,
    getAUser,
    deleteAUser,
    updateAUser,
    blockUser,
    unblockUser,
    handlerRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishList,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus,
};