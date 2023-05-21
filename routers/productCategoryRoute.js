const express = require('express');
const router = express.Router();
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware.js');
const { 
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    getProductCategory,
    getAllProductCategory } = require('../controller/productCategoryCtrl.js');

router.post('/',authMiddleware,isAdmin, createProductCategory);
router.put('/:id',authMiddleware,isAdmin, updateProductCategory);
router.delete('/:id',authMiddleware,isAdmin, deleteProductCategory);
router.get('/:id', getProductCategory);
router.get('/', authMiddleware,isAdmin, getAllProductCategory);

module.exports = router;