const express = require('express');
const router = express.Router();
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware.js');
const { 
    createBrand,
    updateBrand,
    deleteBrand,
    getBrand,
    getAllBrand } = require('../controller/brandCtrl.js');

router.post('/',authMiddleware,isAdmin, createBrand);
router.put('/:id',authMiddleware,isAdmin, updateBrand);
router.delete('/:id',authMiddleware,isAdmin, deleteBrand);
router.get('/:id', getBrand);
router.get('/', authMiddleware,isAdmin, getAllBrand);

module.exports = router;