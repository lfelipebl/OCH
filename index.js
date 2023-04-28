const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config()
const PORT = process.env.PORT;

const authRouter = require('./routers/authRoute.js');
const dbConnect = require('./config/dbConnect.js');
const { notFound, errorHandler } = require('./middlewares/errorHandler.js');
const cookieParser = require('cookie-parser');

dbConnect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
 
app.use('/api/user',authRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () =>{
    console.log(`Server is running at PORT ${PORT} ...`);
});


