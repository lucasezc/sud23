import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.ts";
import User from "./models/user.ts";

dotenv.config();

const PORT = Number(process.env.PORT ?? 9010);
const mongoURL = process.env.DATABASE_URL;

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required. Add it to server/.env (for example: openssl rand -hex 32).");
}

if (!mongoURL) {
    throw new Error("DATABASE_URL is required. Add your MongoDB connection string to server/.env.");
}

try {
    await mongoose.connect(mongoURL);
    console.log("MongoDB connected");

    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase().trim() });
        if (!existingAdmin) {
            await User.create({
                name: ADMIN_NAME ?? "Administrador",
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: "admin",
                emailVerified: true,
            });
            console.log("Initial administrator created");
        } else if (existingAdmin.role !== "admin") {
            existingAdmin.role = "admin";
            await existingAdmin.save();
            console.log("Existing account promoted to administrator");
        }
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
} catch (error) {
    console.error("Could not connect to MongoDB:", error);
    process.exit(1);
}
