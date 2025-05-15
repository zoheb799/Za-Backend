import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
    {
        fullName: { 
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        avatar: {
            type: String,
            required: false,
            default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        role: {
            type: String,
            enum: ["buyer", "seller"], // Changed roles to 'buyer' and 'seller'
            required: true,
            default: "buyer", // Default is 'buyer'
        },
        refreshToken: {
            type: String,
            default: null,
        },
        accessToken: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ["Online", "Offline"],
            default: "Offline",
        },
        socketId: {
            type: String, // This field stores the user's socket ID for real-time communication
        },
        cart: [
            {
              productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
              },
              title: String,
              image: String,
              price: Number,
              quantity: {
                type: Number,
                default: 1,
              }
            }
          ],
        orders: {
            type: [{ type: Schema.Types.ObjectId, ref: "Order" }], // Array of user orders
            default: [],
        },
        wishlist: {
            type: [{ type: Schema.Types.ObjectId, ref: "Product" }], // Array of products in the wishlist
            default: [],
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcryptjs.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcryptjs.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

const User = mongoose.model("User", userSchema);
export default User;
