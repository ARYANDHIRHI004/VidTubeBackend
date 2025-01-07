import mongoose from "mongoose";
import {dbname} from "../constants.js"

const connectDB = async (params) => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URI}/${dbname}`)
    console.log(`MongoDB connected successfully !! DB HOST: ${connectionInstance.connection.host}`);
    
  } catch (error) {
    console.log("MongoDB connection error");
    process.exit(1)
    
  }
}

export default connectDB
