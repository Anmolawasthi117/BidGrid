import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import logger from "./utils/logger.js"; // Ensure logger is imported

dotenv.config({ path: "./src/.env" });

const PORT = process.env.PORT || 3000;

// Start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}.....`);
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error", err);
  });
