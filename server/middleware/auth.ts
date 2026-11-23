import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: { id: string; role: "customer" | "admin" };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({ message: "JWT_SECRET is not configured" });
        return;
    }

    try {
        const payload = jwt.verify(authorization.slice(7), secret) as { id: string; role: "customer" | "admin" };
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ message: "Invalid or expired session" });
    }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "admin") {
        res.status(403).json({ message: "Administrator access required" });
        return;
    }
    next();
};
