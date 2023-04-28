const { default: mongoose } = require("mongoose")

const dbConnect = () => {
    try{
        const conn = mongoose.connect(process.env.MONGODB_URL);   
        console.log('Database connected succesfully');    
    } catch (err){
        console.log(`Database error: ${err}`);
    }}

module.exports = dbConnect;