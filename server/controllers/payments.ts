import express, { type Request, type Response } from "express";
import mongoose from "mongoose";
import Product from "../models/product.ts";
import Order from "../models/order.ts";
import { type AuthRequest, requireAuth } from "../middleware/auth.ts";
import crypto from "node:crypto";

const paymentsRouter = express.Router();
const preferenceUrl = "https://api.mercadopago.com/checkout/preferences";

interface CheckoutItemInput {
    productId: string;
    quantity: number;
    size?: string;
}

interface CheckoutAddress {
    street: string;
    number: string;
    floor: string;
    apartment: string;
    city: string;
    province: string;
    zipCode: string;
}

interface CheckoutCustomer {
    name: string;
    email: string;
    phone: string;
}

const parseCheckoutItems = (items: unknown): CheckoutItemInput[] | null => {
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) return null;

    const parsed: CheckoutItemInput[] = [];
    for (const item of items) {
        if (!item || typeof item !== "object" || !("productId" in item) ||
            typeof item.productId !== "string" || !mongoose.isValidObjectId(item.productId) ||
            !("quantity" in item) || typeof item.quantity !== "number" ||
            !Number.isInteger(item.quantity) || item.quantity < 1 ||
            ("size" in item && item.size !== undefined && typeof item.size !== "string")) {
            return null;
        }
        parsed.push({
            productId: item.productId,
            quantity: item.quantity,
            ...(typeof item.size === "string" ? { size: item.size } : {}),
        });
    }

    return parsed;
};

const parseCustomer = (value: unknown): CheckoutCustomer | null => {
    if (!value || typeof value !== "object") return null;
    const record = value as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const email = typeof record.email === "string" ? record.email.trim() : "";
    const phone = typeof record.phone === "string" ? record.phone.trim() : "";
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone) return null;
    return { name, email, phone };
};

const parseAddress = (value: unknown): CheckoutAddress | null => {
    if (!value || typeof value !== "object") return null;
    const record = value as Record<string, unknown>;
    const street = typeof record.street === "string" ? record.street.trim() : "";
    const number = typeof record.number === "string" ? record.number.trim() : "";
    const city = typeof record.city === "string" ? record.city.trim() : "";
    const province = typeof record.province === "string" ? record.province.trim() : "";
    const zipCode = typeof record.zipCode === "string" ? record.zipCode.trim() : "";
    if (!street || !number || !city || !province || !zipCode) return null;
    return {
        street,
        number,
        floor: typeof record.floor === "string" ? record.floor.trim() : "",
        apartment: typeof record.apartment === "string" ? record.apartment.trim() : "",
        city,
        province,
        zipCode,
    };
};

const getShippingCost = (subtotal: number): number => {
    const configuredCost = Number(process.env.MERCADOPAGO_SHIPPING_COST ?? 5000);
    const freeThreshold = Number(process.env.MERCADOPAGO_FREE_SHIPPING_THRESHOLD ?? 100000);
    const cost = Number.isFinite(configuredCost) && configuredCost >= 0 ? configuredCost : 5000;
    if (Number.isFinite(freeThreshold) && freeThreshold > 0 && subtotal >= freeThreshold) return 0;
    return cost;
};

const webhookSignatureValid = (req: Request): boolean => {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
    if (!secret) return true;
    const signature = req.headers["x-signature"];
    const requestId = req.headers["x-request-id"];
    if (typeof signature !== "string" || typeof requestId !== "string") return false;
    const parts = Object.fromEntries(signature.split(",").map((part) => {
        const separator = part.indexOf("=");
        return separator >= 0 ? [part.slice(0, separator).trim(), part.slice(separator + 1).trim()] : ["", ""];
    }));
    const timestamp = parts.ts;
    const provided = parts.v1;
    if (!timestamp || !provided) return false;
    const manifest = `id:${String(req.query["data.id"] ?? req.body?.data?.id ?? "")};request-id:${requestId};ts:${timestamp};`;
    const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
    if (provided.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
};

paymentsRouter.post("/mercadopago/shipping-quote", async (req: Request, res: Response) => {
    const items = parseCheckoutItems(req.body?.items);
    if (!items) {
        res.status(400).json({ message: "El carrito está vacío o contiene productos/cantidades inválidas." });
        return;
    }

    const products = await Product.find({
        _id: { $in: items.map((item) => item.productId) },
        active: { $ne: false },
    });
    const productsById = new Map(products.map((product) => [String(product._id), product]));
    let subtotal = 0;
    for (const item of items) {
        const product = productsById.get(item.productId);
        if (!product) {
            res.status(400).json({ message: "Un producto del carrito ya no está disponible." });
            return;
        }
        if (!Number.isFinite(product.price) || product.price < 1) {
            res.status(400).json({ message: `El precio de ${product.product} debe corregirse antes de venderlo.` });
            return;
        }
        if (item.quantity > product.stock) {
            res.status(400).json({ message: `No hay stock suficiente de ${product.product}.` });
            return;
        }
        subtotal += product.price * item.quantity;
    }

    const deliveryCost = getShippingCost(subtotal);
    res.status(200).json({ deliveryCost, pickupCost: 0, freeShipping: deliveryCost === 0 });
});

paymentsRouter.post("/mercadopago/preference", async (req: Request, res: Response) => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
    if (!accessToken) {
        res.status(503).json({ message: "Mercado Pago no está configurado. Agrega MERCADOPAGO_ACCESS_TOKEN al .env del servidor." });
        return;
    }

    const items = parseCheckoutItems(req.body?.items);
    if (!items) {
        res.status(400).json({ message: "El carrito está vacío o contiene productos/cantidades inválidas." });
        return;
    }
    const customer = parseCustomer(req.body?.customer);
    if (!customer) {
        res.status(400).json({ message: "Completa nombre, email y teléfono para continuar." });
        return;
    }
    const shippingMethod = req.body?.shippingMethod === "pickup" ? "pickup" : "delivery";
    const address = shippingMethod === "delivery" ? parseAddress(req.body?.address) : null;
    if (shippingMethod === "delivery" && !address) {
        res.status(400).json({ message: "Completa la dirección de entrega." });
        return;
    }

    const products = await Product.find({
        _id: { $in: items.map((item) => item.productId) },
        active: { $ne: false },
    });
    const productsById = new Map(products.map((product) => [String(product._id), product]));
    const preferenceItems: Array<{
        id: string;
        title: string;
        quantity: number;
        currency_id: "ARS";
        unit_price: number;
    }> = [];
    const orderItems: Array<{
        productId: mongoose.Types.ObjectId;
        title: string;
        quantity: number;
        size: string;
        unitPrice: number;
    }> = [];
    let subtotal = 0;

    for (const item of items) {
        const product = productsById.get(item.productId);
        if (!product) {
            res.status(400).json({ message: "Un producto del carrito ya no está disponible." });
            return;
        }
        if (!Number.isFinite(product.price) || product.price < 1) {
            res.status(400).json({ message: `El precio de ${product.product} debe corregirse antes de venderlo.` });
            return;
        }
        if (item.quantity > product.stock) {
            res.status(400).json({ message: `No hay stock suficiente de ${product.product}.` });
            return;
        }
        if (item.size && !product.sizes.includes(item.size)) {
            res.status(400).json({ message: `El talle seleccionado para ${product.product} no está disponible.` });
            return;
        }

        preferenceItems.push({
            id: item.productId,
            title: item.size ? `${product.product} - Talle ${item.size}` : product.product,
            quantity: item.quantity,
            currency_id: "ARS",
            unit_price: product.price,
        });
        orderItems.push({
            productId: product._id,
            title: item.size ? `${product.product} - Talle ${item.size}` : product.product,
            quantity: item.quantity,
            size: item.size ?? "",
            unitPrice: product.price,
        });
        subtotal += product.price * item.quantity;
    }

    const shippingCost = shippingMethod === "pickup" ? 0 : getShippingCost(subtotal);
    const externalReference = crypto.randomUUID();
    const order = await Order.create({
        externalReference,
        customer,
        items: orderItems,
        shipping: {
            method: shippingMethod,
            cost: shippingCost,
            address: address ?? {
                street: "",
                number: "",
                floor: "",
                apartment: "",
                city: "",
                province: "",
                zipCode: "",
            },
        },
        subtotal,
        total: subtotal + shippingCost,
        status: "pending",
    });

    let response: globalThis.Response;
    const makePreferenceBody = (automaticShipping: boolean) => {
        const preferenceBody: Record<string, unknown> = {
            items: preferenceItems,
            external_reference: externalReference,
        };
        const clientUrl = (process.env.CLIENT_URL ?? "http://localhost:5173").replace(/\/+$/, "");
        const publicUrl = process.env.PUBLIC_URL?.trim().replace(/\/+$/, "");
        const isPublicClient = clientUrl.startsWith("https://") && !clientUrl.includes("localhost");

        preferenceBody.back_urls = {
            success: `${clientUrl}/#/cuenta`,
            failure: `${clientUrl}/#/cuenta`,
            pending: `${clientUrl}/#/cuenta`,
        };
        if (isPublicClient) {
            preferenceBody.auto_return = "approved";
        }
        if (publicUrl) {
            preferenceBody.notification_url = `${publicUrl}/api/payments/mercadopago/webhook`;
        }
        if (shippingMethod === "delivery" && address && automaticShipping) {
            preferenceBody.shipments = {
                mode: "me2",
                cost: shippingCost,
                free_shipping: shippingCost === 0,
                receiver_address: {
                    zip_code: address.zipCode,
                    street_name: address.street,
                    street_number: address.number,
                    floor: address.floor,
                    apartment: address.apartment,
                    city_name: address.city,
                    state_name: address.province,
                },
            };
        } else {
            preferenceBody.shipments = { mode: "not_specified", cost: 0, free_shipping: true };
        }
        if (shippingMethod === "delivery" && !automaticShipping && shippingCost > 0) {
            preferenceBody.items = [
                ...preferenceItems,
                {
                    id: "shipping",
                    title: "Envio a domicilio",
                    quantity: 1,
                    currency_id: "ARS",
                    unit_price: shippingCost,
                },
            ];
        }
        preferenceBody.payer = { name: customer.name, email: customer.email };
        return preferenceBody;
    };
    try {
        response = await fetch(preferenceUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(makePreferenceBody(true)),
        });
    } catch (error) {
        console.error("Mercado Pago connection failed:", error instanceof Error ? error.message : "Unknown connection error");
        res.status(502).json({ message: "No se pudo conectar con Mercado Pago. Inténtalo nuevamente." });
        return;
    }

    let data: {
        id?: unknown;
        init_point?: unknown;
        sandbox_init_point?: unknown;
        message?: unknown;
        error?: unknown;
        cause?: unknown;
    };
    try {
        data = await response.json() as typeof data;
    } catch {
        console.error("Mercado Pago returned an invalid preference response:", response.status);
        res.status(502).json({ message: "Mercado Pago devolvió una respuesta inválida." });
        return;
    }

    const me2Error = !response.ok &&
        shippingMethod === "delivery" &&
        typeof data.message === "string" &&
        /me2|invalid_shipments/i.test(`${data.message} ${String(data.error ?? "")}`);

    if (me2Error) {
        console.warn("Mercado Envios (me2) is not active on the collector account; using fixed shipping instead.");
        try {
            response = await fetch(preferenceUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(makePreferenceBody(false)),
            });
            data = await response.json() as typeof data;
        } catch (error) {
            console.error("Mercado Pago fallback preference failed:", error instanceof Error ? error.message : "Unknown error");
            await Order.findByIdAndDelete(order._id);
            res.status(502).json({ message: "No se pudo iniciar el pago con envío fijo." });
            return;
        }
    }

    if (!response.ok) {
        console.error("Mercado Pago preference creation failed:", response.status,
            JSON.stringify({ message: data.message, error: data.error, cause: data.cause }));
        await Order.findByIdAndDelete(order._id);
        res.status(502).json({ message: "Mercado Pago no pudo iniciar el pago. Revisa la configuración de la cuenta." });
        return;
    }

    const checkoutUrl = accessToken.startsWith("TEST-") ? data.sandbox_init_point : data.init_point;
    if (typeof checkoutUrl !== "string" || !checkoutUrl.startsWith("https://")) {
        console.error("Mercado Pago preference response is missing a valid checkout URL");
        res.status(502).json({ message: "Mercado Pago no devolvió un enlace de pago válido." });
        return;
    }

    if (typeof data.id === "string") {
        order.preferenceId = data.id;
        await order.save();
    }

    res.status(201).json({
        checkoutUrl,
        orderId: String(order._id),
        shippingCost,
        total: subtotal + shippingCost,
    });
});

paymentsRouter.post("/mercadopago/webhook", async (req: Request, res: Response) => {
    if (!webhookSignatureValid(req)) {
        res.status(401).json({ message: "Firma de webhook inválida." });
        return;
    }

    const paymentId = String(
        req.query["data.id"] ??
        req.body?.data?.id ??
        req.body?.id ??
        "",
    );
    if (!paymentId) {
        res.status(200).json({ received: true });
        return;
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
    if (!accessToken) {
        res.status(503).json({ message: "Mercado Pago no está configurado." });
        return;
    }

    try {
        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!paymentResponse.ok) {
            res.status(502).json({ message: "No se pudo consultar el pago." });
            return;
        }
        const payment = await paymentResponse.json() as {
            external_reference?: unknown;
            status?: unknown;
            status_detail?: unknown;
            id?: unknown;
        };
        if (typeof payment.external_reference !== "string") {
            res.status(200).json({ received: true });
            return;
        }

        const order = await Order.findOne({ externalReference: payment.external_reference });
        if (!order) {
            res.status(200).json({ received: true });
            return;
        }

        const paymentStatus = typeof payment.status === "string" ? payment.status : "";
        order.paymentStatus = paymentStatus;
        order.paymentStatusDetail = typeof payment.status_detail === "string" ? payment.status_detail : "";
        order.paymentId = String(payment.id ?? paymentId);

        if (paymentStatus === "approved" && order.status !== "paid") {
            const decrementedItems: Array<{ productId: mongoose.Types.ObjectId; quantity: number }> = [];
            for (const orderItem of order.items) {
                const updated = await Product.findOneAndUpdate(
                    { _id: orderItem.productId, stock: { $gte: orderItem.quantity } },
                    { $inc: { stock: -orderItem.quantity } },
                    { new: true },
                );
                if (!updated) {
                    for (const revertedItem of decrementedItems) {
                        await Product.updateOne(
                            { _id: revertedItem.productId },
                            { $inc: { stock: revertedItem.quantity } },
                        );
                    }
                    order.status = "stock_error";
                    order.paymentStatusDetail = "approved_but_stock_was_no_longer_available";
                    await order.save();
                    res.status(200).json({ received: true, stockError: true });
                    return;
                }
                decrementedItems.push(orderItem);
            }
            order.status = "paid";
            order.paidAt = new Date();
        } else if (paymentStatus === "cancelled" || paymentStatus === "rejected") {
            order.status = "cancelled";
        }
        await order.save();
        res.status(200).json({ received: true });
    } catch (error) {
        console.error("Mercado Pago webhook processing failed:", error instanceof Error ? error.message : "Unknown error");
        res.status(500).json({ message: "No se pudo procesar la notificación." });
    }
});

export default paymentsRouter;
