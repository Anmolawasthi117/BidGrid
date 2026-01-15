import dotenv from "dotenv";
dotenv.config({ path: "./src/.env" });

import { app } from "./app.js";
import connectDB from "./db/index.js";
import logger from "./utils/logger.js"; // Ensure logger is imported

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
