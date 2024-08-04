import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const db:string = process.env.MONGO_URI || "";

const dbConnect = async () => {
    try {
        await mongoose.connect(db)
        .then((data:any) => {
            console.log(`MongoDB Connected: ${data.connection.host}`);
        })
    } catch (error:any) {
        console.log(error.message)
        process.exit(1)
    }
}

export default dbConnect