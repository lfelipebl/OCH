const { generateToken } = require('../config/jwtToken.js');
const User = require('../models/userModel.js');
const asyncHandler = require('express-async-handler');
const validateDBId = require('../utls/validatedbid.js');
const { generateRefreshToken } = require('../config/refreshToken.js');
const jwt = require('jsonwebtoken');


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
})

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
};