import express, { ErrorRequestHandler } from "express";
import productsRouter from "./controllers/products.ts";
import authRouter from "./controllers/auth.ts";
import paymentsRouter from "./controllers/payments.ts";
import cors from "cors";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://lucasezc.github.io",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    const configuredOrigin = process.env.CLIENT_URL ? new URL(process.env.CLIENT_URL).origin : undefined;
    if (origin && (origin.startsWith("http://localhost:") || origin === configuredOrigin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Vary", "Origin");
    }
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");

    if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
    }

    next();
});

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/payments", paymentsRouter);

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    if (error?.name === "ValidationError") {
        res.status(400).json({ message: error.message });
        return;
    }

    console.error(error);
    res.status(500).json({ message: "Internal server error" });
};

app.use(errorHandler);

export default app;