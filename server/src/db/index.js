import mongoose from "mongoose";
import {DB_NAME} from "../constant.js"
import logger from "../utils/logger.js";
import dotenv from 'dotenv';

dotenv.config({ path: './src/.env' });

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );
        logger.info(`Mongo DB connected ! DB host: ${connectionInstance.connection.host}`);
    } catch (error) {
        logger.error("Mongo DB connection error", error);
        process.exit(1);
    }
}

export default connectDB;