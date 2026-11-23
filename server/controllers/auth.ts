import express, { type Request, type Response } from "express";
import mongoose from "mongoose";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import nodemailer, { type SendMailOptions } from "nodemailer";
import User from "../models/user.ts";
import Product from "../models/product.ts";
import { requireAuth, type AuthRequest } from "../middleware/auth.ts";

const authRouter = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getSecret = () => {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
    return process.env.JWT_SECRET;
};

const createToken = (id: string, role: "customer" | "admin") =>
    jwt.sign({ id, role }, getSecret(), { expiresIn: "7d" });

const hashVerificationToken = (token: string) =>
    crypto.createHash("sha256").update(token).digest("hex");

const normalizeEmail = (email: string) => email.toLowerCase().trim();

const isValidEmail = (email: unknown): email is string =>
    typeof email === "string" && emailPattern.test(email.trim());

const clientUrl = () => (process.env.CLIENT_URL ?? "http://localhost:5173").replace(/\/+$/, "");

const createTransporter = () => {
    const smtpSettings = [process.env.SMTP_HOST, process.env.SMTP_USER, process.env.SMTP_PASS];
    if (smtpSettings.every((setting) => !setting)) {
        return null;
    }
    if (smtpSettings.some((setting) => !setting)) {
        throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS must all be configured");
    }

    const port = Number(process.env.SMTP_PORT ?? 587);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("SMTP_PORT must be a valid port number");
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
};

const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;",
    })[character] ?? character);

const sendSmtpEmail = async (
    transporter: NonNullable<ReturnType<typeof createTransporter>>,
    message: SendMailOptions,
) => {
    const result = await transporter.sendMail(message);
    if (result.accepted.length === 0) {
        throw new Error("SMTP server did not accept the email recipient");
    }
};

const sendVerificationEmail = async (
    email: string,
    name: string,
    token: string,
    transporter: ReturnType<typeof createTransporter>,
) => {
    const verifyUrl = `${clientUrl()}/#/verificar/${token}`;
    if (!transporter) {
        throw new Error("Email verification is not configured on the server");
    }

    await sendSmtpEmail(transporter, {
        from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
        to: email,
        subject: "Verifica tu cuenta - SÜD23",
        html: `<p>Hola ${escapeHtml(name)},</p><p>Confirma tu cuenta haciendo clic aquí:</p><p><a href="${verifyUrl}">Verificar correo</a></p><p>Este enlace vence en 24 horas.</p>`,
    });
};

const sendMailError = (res: Response, error: unknown) => {
    console.error("SMTP email delivery failed:", error instanceof Error ? error.message : "Unknown SMTP error");
    res.status(502).json({ message: "No se pudo enviar el correo. Revisa la configuración SMTP del servidor e inténtalo nuevamente." });
};

const createSession = (user: { _id: unknown; name: string; email: string; role: string }, res: Response) => {
    const role = user.role as "customer" | "admin";
    const token = createToken(String(user._id), role);
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role } });
};

authRouter.post("/register", async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    if (typeof name !== "string" || !name.trim() || !isValidEmail(email) ||
        typeof password !== "string" || password.length < 8) {
        res.status(400).json({ message: "Ingresa un nombre, un email válido y una contraseña de al menos 8 caracteres" });
        return;
    }

    const normalizedEmail = normalizeEmail(email);
    let transporter: ReturnType<typeof createTransporter>;
    try {
        transporter = createTransporter();
    } catch (error) {
        res.status(503).json({ message: error instanceof Error ? error.message : "La configuración SMTP no es válida" });
        return;
    }
    if (!transporter) {
        res.status(503).json({ message: "La verificación por email no está configurada en el servidor" });
        return;
    }

    let user = await User.findOne({ email: normalizedEmail });
    if (user?.emailVerified) {
        res.status(409).json({ message: "Ese email ya está registrado" });
        return;
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    if (user) {
        user.name = name.trim();
        user.password = password;
        user.verificationTokenHash = hashVerificationToken(verificationToken);
        user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();
    } else {
        user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: "customer",
            emailVerified: false,
            verificationTokenHash: hashVerificationToken(verificationToken),
            verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
    }

    try {
        await sendVerificationEmail(normalizedEmail, user.name, verificationToken, transporter);
    } catch (error) {
        sendMailError(res, error);
        return;
    }
    res.status(201).json({ message: "Cuenta creada. Revisa tu bandeja de entrada y correo no deseado para verificarla.", email: user.email });
});

authRouter.post("/resend-verification", async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!isValidEmail(email)) {
        res.status(400).json({ message: "Ingresa un email válido" });
        return;
    }

    let transporter: ReturnType<typeof createTransporter>;
    try {
        transporter = createTransporter();
    } catch (error) {
        res.status(503).json({ message: error instanceof Error ? error.message : "La configuración SMTP no es válida" });
        return;
    }
    if (!transporter) {
        res.status(503).json({ message: "La verificación por email no está configurada en el servidor" });
        return;
    }

    const user = await User.findOne({ email: normalizeEmail(email) });
    const message = "Si existe una cuenta pendiente para ese email, enviaremos un nuevo enlace. Revisa también el correo no deseado.";
    if (!user || user.emailVerified) {
        res.status(200).json({ message });
        return;
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationTokenHash = hashVerificationToken(verificationToken);
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    try {
        await sendVerificationEmail(user.email, user.name, verificationToken, transporter);
    } catch (error) {
        sendMailError(res, error);
        return;
    }
    res.status(200).json({ message });
});

authRouter.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!isValidEmail(email) || typeof password !== "string" || !password) {
        res.status(400).json({ message: "Ingresa un email y una contraseña válidos" });
        return;
    }

    const user = await User.findOne({ email: normalizeEmail(email) }).select("+password");
    if (!user || !(await (user as unknown as { comparePassword: (password: string) => Promise<boolean> }).comparePassword(password))) {
        res.status(401).json({ message: "Email o contraseña incorrectos" });
        return;
    }

    if (!user.emailVerified) {
        res.status(403).json({ message: "Verifica tu correo antes de iniciar sesión" });
        return;
    }

    createSession(user, res);
});

authRouter.post("/forgot-password", async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!isValidEmail(email)) {
        res.status(400).json({ message: "Ingresa un email válido" });
        return;
    }

    let transporter: ReturnType<typeof createTransporter>;
    try {
        transporter = createTransporter();
    } catch (error) {
        res.status(503).json({ message: error instanceof Error ? error.message : "La configuración SMTP no es válida" });
        return;
    }
    if (!transporter) {
        res.status(503).json({ message: "La recuperación por email no está configurada en el servidor" });
        return;
    }

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (user) {
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetTokenHash = hashVerificationToken(resetToken);
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        const resetUrl = `${clientUrl()}/#/restablecer/${resetToken}`;
        try {
            await sendSmtpEmail(transporter, {
                from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
                to: user.email,
                subject: "Recupera tu contraseña - SÜD23",
                html: `<p>Hola ${escapeHtml(user.name)},</p><p>Para elegir una nueva contraseña, haz clic aquí:</p><p><a href="${resetUrl}">Restablecer contraseña</a></p><p>Este enlace vence en una hora. Si no solicitaste el cambio, ignora este correo.</p>`,
            });
        } catch (error) {
            sendMailError(res, error);
            return;
        }
    }

    res.status(200).json({ message: "Si existe una cuenta con ese email, recibirás un enlace para restablecer la contraseña." });
});

authRouter.post("/reset-password", async (req: Request, res: Response) => {
    const { token, password } = req.body;
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token) ||
        typeof password !== "string" || password.length < 8) {
        res.status(400).json({ message: "El enlace o la nueva contraseña no son válidos" });
        return;
    }

    const user = await User.findOne({
        passwordResetTokenHash: hashVerificationToken(token),
        passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpires +password");

    if (!user) {
        res.status(400).json({ message: "El enlace es inválido o venció" });
        return;
    }

    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada. Ya puedes iniciar sesión." });
});

authRouter.post("/google", async (req: Request, res: Response) => {
    const { credential } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        res.status(503).json({ message: "El inicio de sesión con Google no está configurado" });
        return;
    }
    if (typeof credential !== "string" || !credential) {
        res.status(400).json({ message: "Falta la credencial de Google" });
        return;
    }

    let payload: { email?: string; email_verified?: boolean; sub?: string; name?: string } | undefined;
    try {
        const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken: credential, audience: clientId });
        payload = ticket.getPayload();
    } catch {
        res.status(401).json({ message: "No se pudo verificar la cuenta de Google" });
        return;
    }

    if (!payload?.email || payload.email_verified !== true || !payload.sub) {
        res.status(401).json({ message: "La cuenta de Google no tiene un email verificado" });
        return;
    }

    const email = normalizeEmail(payload.email);
    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            name: payload.name?.trim() || email.split("@")[0],
            email,
            password: crypto.randomBytes(32).toString("hex"),
            role: "customer",
            emailVerified: true,
        });
    } else if (!user.emailVerified) {
        user.emailVerified = true;
        user.verificationTokenHash = undefined;
        user.verificationExpires = undefined;
        await user.save();
    }

    createSession(user, res);
});

authRouter.get("/verify-email/:token", async (req: Request, res: Response) => {
    if (typeof req.params.token !== "string") {
        res.status(400).json({ message: "El enlace es inválido o venció" });
        return;
    }

    const tokenHash = hashVerificationToken(req.params.token);
    const user = await User.findOne({
        verificationTokenHash: tokenHash,
        verificationExpires: { $gt: new Date() },
    }).select("+verificationTokenHash +verificationExpires");

    if (!user) {
        res.status(400).json({ message: "El enlace es inválido o venció" });
        return;
    }

    user.emailVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Correo verificado. Ya puedes iniciar sesión." });
});

authRouter.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?.id);
    if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
    }

    res.status(200).json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

authRouter.get("/favorites", requireAuth, async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?.id).populate({
        path: "favorites",
        match: { active: true },
    });
    if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
    }

    res.status(200).json(user.favorites);
});

authRouter.post("/favorites/:productId", requireAuth, async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;
    if (typeof productId !== "string" || !mongoose.isValidObjectId(productId)) {
        res.status(400).json({ message: "Invalid product ID" });
        return;
    }

    const product = await Product.findOne({ _id: productId, active: true });
    if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
    }

    const user = await User.findByIdAndUpdate(
        req.user?.id,
        { $addToSet: { favorites: product._id } },
        { new: true },
    );
    if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
    }

    res.status(200).json({ message: "Product added to favorites" });
});

authRouter.delete("/favorites/:productId", requireAuth, async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;
    if (typeof productId !== "string" || !mongoose.isValidObjectId(productId)) {
        res.status(400).json({ message: "Invalid product ID" });
        return;
    }

    const user = await User.findByIdAndUpdate(
        req.user?.id,
        { $pull: { favorites: productId } },
        { new: true },
    );
    if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
    }

    res.status(204).send();
});

export default authRouter;
