import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ["Available", "Out of stock", "Discontinued"], default: "Available" },
  images: [{ type: String }],
  description: { type: String, required: true },
  stock: { type: Number, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
