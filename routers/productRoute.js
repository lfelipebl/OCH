const express = require ('express');
const { 
    crateProduct, getaProduct, getAllProduct, updateProduct, deleteProduct,
} = require('../controller/productCtrl.js');
const router = express.Router();
const {isAdmin, authMiddleware} = require('../middlewares/authMiddleware.js');

router.post('/',authMiddleware,isAdmin, crateProduct); //Crear producto
router.put('/:id',authMiddleware,isAdmin, updateProduct);//Actualizar producto
router.delete('/:id',authMiddleware,isAdmin, deleteProduct);//Borrar producto
router.get('/:id', getaProduct); // Ver producto
router.get('/', getAllProduct); // Ver todos los productos


module.exports = router;