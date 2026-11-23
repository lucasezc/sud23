import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Product from "../models/product.ts";
import { requireAuth, requireAdmin } from "../middleware/auth.ts";

const productsRouter = express.Router();

productsRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter: Record<string, unknown> = {};

        if (req.query.active !== undefined) {
            filter.active = req.query.active === "true";
        }

        if (typeof req.query.search === "string" && req.query.search.trim()) {
            const search = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.product = { $regex: search, $options: "i" };
            if (req.query.active === undefined) filter.active = true;
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
});

productsRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            res.status(400).json({ message: "Invalid product ID" });
            return;
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
});

productsRouter.post("/", requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
});

productsRouter.patch("/:id", requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            res.status(400).json({ message: "Invalid product ID" });
            return;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
});

productsRouter.delete("/:id", requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            res.status(400).json({ message: "Invalid product ID" });
            return;
        }

        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default productsRouter;