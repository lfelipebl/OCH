const express = require('express');
const { 
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
} = require('../controller/userCtrl.js');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware.js');
const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.get('/all-users', getAllUser);
router.get('/refresh',handlerRefreshToken);
router.get('/logout', logout)
router.get('/:id', authMiddleware, isAdmin, getAUser);
router.delete('/:id',authMiddleware, isAdmin, deleteAUser);
router.put('/edit-user',authMiddleware, updateAUser);
router.put('/block-user/:id',authMiddleware,isAdmin, blockUser);
router.put('/unblock-user/:id',authMiddleware,isAdmin, unblockUser);


module.exports = router;