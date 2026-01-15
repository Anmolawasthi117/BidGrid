import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import logger from "./utils/logger.js";

// Route imports
import healthcheackRouter from "./routes/healthcheack.routes.js";
import userRouter from "./routes/user.routes.js";
import vendorRouter from "./routes/vendor.routes.js";
import rfpRouter from "./routes/rfp.routes.js";
import proposalRouter from "./routes/proposal.routes.js";
import ingestionRouter from "./routes/ingestion.routes.js";

const app = express();
const morganFormat = ":method :url :status :response-time ms";

// ============== MIDDLEWARE ==============

// Body parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Static files
app.use(express.static("public"));

// Cookie parsing
app.use(cookieParser());

// Request logging
app.use(morgan(morganFormat, {
    stream: {
        write: (message) => {
            const logObject = {
                method: message.split(" ")[0],
                url: message.split(" ")[1],
                status: message.split(" ")[2],
                responseTime: message.split(" ")[3],
            };
            logger.info(JSON.stringify(logObject));
        },
    },
}));

// ============== ROUTES ==============

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'BidGrid API Server' });
});

// API routes
app.use("/api/v1/healthcheack", healthcheackRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/vendors", vendorRouter);
app.use("/api/v1/rfps", rfpRouter);
app.use("/api/v1/proposals", proposalRouter);
app.use("/api/v1/ingestion", ingestionRouter);

// ============== ERROR HANDLER ==============
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || []
    });
});

export { app };