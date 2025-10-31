import mongoose from "mongoose";


const Dbconnection = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI); 
        console.log(`Mongo Connected ${conn.connection.host}`);  
    }
    catch{
        console.error(`Error ${error.message}`);
        process.exit(1);
    }
    
}

export default Dbconnection;