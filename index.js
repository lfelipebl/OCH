const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config()
const PORT = process.env.PORT;

const authRouter = require('./routers/authRoute.js');
const productRoute = require('./routers/productRoute.js');
const blogRoute = require('./routers/blogRoute.js');
const ProductCategoryRoute = require('./routers/productCategoryRoute.js');
const BlogCategoryRoute = require('./routers/blogCatRoute.js');
const BrandRoute = require('./routers/brandRouter.js');
const CouponRoute = require('./routers/couponRoute.js');


const dbConnect = require('./config/dbConnect.js');
const { notFound, errorHandler } = require('./middlewares/errorHandler.js');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

dbConnect();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
 
app.use('/och/user',authRouter);
app.use('/och/product',productRoute);
app.use('/och/blog',blogRoute);
app.use('/och/product-category',ProductCategoryRoute);
app.use('/och/blog-category',BlogCategoryRoute);
app.use('/och/brand',BrandRoute);
app.use('/och/coupon',CouponRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () =>{
    console.log(`Server is running at PORT ${PORT} ...`);
});


