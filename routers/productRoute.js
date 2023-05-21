const express = require ('express');
const { 
    crateProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    uploadImages,
} = require('../controller/productCtrl.js');
const router = express.Router();
const {isAdmin, authMiddleware} = require('../middlewares/authMiddleware.js');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages.js');

router.post('/',authMiddleware,isAdmin, crateProduct); //Crear producto
router.put(
    '/upload/:id',
    authMiddleware,
    isAdmin,
    uploadPhoto.array('images',10),
    productImgResize,
    uploadImages
);

router.get('/:id', getaProduct); // Ver producto
router.put('/wishlist',authMiddleware, addToWishlist );
router.put('/rating',authMiddleware, rating );
router.put('/:id',authMiddleware,isAdmin, updateProduct);//Actualizar producto
router.delete('/:id',authMiddleware,isAdmin, deleteProduct);//Borrar producto
router.get('/', getAllProduct); // Ver todos los productos


module.exports = router;