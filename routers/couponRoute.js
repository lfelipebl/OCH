const express = require("express");
const { createCoupon, getAllCoupons, getCoupon, updateCoupon, deleteCoupon } = require("../controller/couponCtrl.js");
const router = express.Router();
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware.js');

router.post('/',authMiddleware,isAdmin, createCoupon);
router.get('/',authMiddleware,isAdmin, getAllCoupons);
router.get('/:id',authMiddleware,isAdmin, getCoupon);
router.put('/:id',authMiddleware,isAdmin, updateCoupon);
router.delete('/:id',authMiddleware,isAdmin, deleteCoupon);

module.exports = router;