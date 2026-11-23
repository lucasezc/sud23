import mongoose, { InferSchemaType } from "mongoose";

const productSchema = new mongoose.Schema(
    {
        product: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, required: true, min: 0, default: 0 },
        active: { type: Boolean, default: true },
        image: { type: String, default: "" },
        images: { type: [String], default: [] },
        sizes: { type: [String], default: ["S", "M", "L", "XL"] },
        category: { type: String, default: "General", trim: true },
        rating: { type: Number, min: 0, max: 5, default: 0 },
        reviews: { type: Number, min: 0, default: 0 },
        weight: { type: Number, min: 0, default: 0 },
        length: { type: Number, min: 0, default: 0 },
        height: { type: Number, min: 0, default: 0 },
        width: { type: Number, min: 0, default: 0 },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true },
);

export type ProductDocument = InferSchemaType<typeof productSchema>;

const Product = mongoose.model("Product", productSchema);

export default Product;