import mongoose from "mongoose"

export const connectDB = async(url)=>{
    try{
        await mongoose.connect(url);
        console.log("Connected to DB");
    }catch(error){
        console.log("Error connecting DB",error);
        process.exit(1)
    }
}

export default connectDB;