const express = require('express');
const router = express.Router();
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware.js');
const { 
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory,
    getBlogCategory,
    getAllBlogCategory } = require('../controller/blogCatCtrl.js');

router.post('/',authMiddleware,isAdmin, createBlogCategory);
router.put('/:id',authMiddleware,isAdmin, updateBlogCategory);
router.delete('/:id',authMiddleware,isAdmin, deleteBlogCategory);
router.get('/:id', getBlogCategory);
router.get('/', authMiddleware,isAdmin, getAllBlogCategory);

module.exports = router;