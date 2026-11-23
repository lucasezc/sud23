import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ["customer", "admin"], default: "customer" },
        emailVerified: { type: Boolean, default: false },
        favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
        verificationTokenHash: { type: String, select: false },
        verificationExpires: { type: Date, select: false },
        passwordResetTokenHash: { type: String, select: false },
        passwordResetExpires: { type: Date, select: false },
    },
    { timestamps: true },
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (password: string) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
