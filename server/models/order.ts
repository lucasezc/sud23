import mongoose, { InferSchemaType } from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        externalReference: { type: String, required: true, unique: true, index: true },
        preferenceId: { type: String, default: "" },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        customer: {
            name: { type: String, required: true, trim: true },
            email: { type: String, required: true, trim: true },
            phone: { type: String, required: true, trim: true },
        },
        items: [{
            productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
            title: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            size: { type: String, default: "" },
            unitPrice: { type: Number, required: true, min: 0 },
        }],
        shipping: {
            method: { type: String, enum: ["delivery", "pickup"], required: true },
            cost: { type: Number, required: true, min: 0 },
            address: {
                street: { type: String, default: "" },
                number: { type: String, default: "" },
                floor: { type: String, default: "" },
                apartment: { type: String, default: "" },
                city: { type: String, default: "" },
                province: { type: String, default: "" },
                zipCode: { type: String, default: "" },
            },
        },
        subtotal: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["pending", "paid", "cancelled", "stock_error"],
            default: "pending",
        },
        paymentStatus: { type: String, default: "" },
        paymentStatusDetail: { type: String, default: "" },
        paymentId: { type: String, default: "" },
        paidAt: { type: Date, default: null },
    },
    { timestamps: true },
);

export type OrderDocument = InferSchemaType<typeof orderSchema>;

const Order = mongoose.model("Order", orderSchema);

export default Order;
