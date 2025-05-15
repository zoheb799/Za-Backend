import productModels from "../models/product.models.js";
import User from "../models/user.models.js";
import { errorHandler } from "../utils/errorHandle.js";
import {apiResponse} from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandle.js";


export const createProduct = asyncHandler(async (req, res, next) => {
  const { title, price, images, description, stock } = req.body;
  
  const sellerId = req.user._id;

  const product = new productModels({ title, price, images, description, stock, sellerId });
  await product.save();

  return res.status(201).json(
    new apiResponse(201, product, "Product created")
  );
});

export const getSellerProducts = asyncHandler(async (req, res, next) => {
  const products = await productModels.find({ sellerId: req.user._id });

  return res.status(200).json(
    new apiResponse(200, products, "Seller products fetched")
  );
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const updated = await productModels.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updated) {
    return next(new errorHandler(404, "Product not found"));
  }

  return res.status(200).json(
    new apiResponse(200, updated, "Product updated")
  );
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const deleted = await productModels.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return next(new errorHandler(404, "Product not found"));
  }

  return res.status(200).json(
    new apiResponse(200, null, "Product deleted")
  );
});

export const getAllProducts = asyncHandler(async (req, res, next) => {
  const products = await productModels
    .find()
    .populate("sellerId", "fullName");

  return res.status(200).json(
    new apiResponse(200, products, "All products fetched")
  );
});

export const getProductById = asyncHandler(async (req, res, next) => {
  const product = await productModels.findById(req.params.id).populate("sellerId", "fullName");

  if (!product) {
    return next(new errorHandler(404, "Product not found"));
  }

  return res.status(200).json(
    new apiResponse(200, product, "Product fetched")
  );
});

export const addToCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const product = await productModels.findById(productId);
  if (!product) {
    return next(new errorHandler(404, "Product not found"));
  }

  const user = await User.findById(userId);

  const alreadyInCart = user.cart.some(
    (item) => item?.productId?.toString() === productId
  );

  if (alreadyInCart) {
    return next(new errorHandler(400, "Product already in cart"));
  }

  user.cart.push({
    productId: product._id,
    title: product.title,
    image: product.images[0],
    price: product.price,
  });

  await user.save();

  return res.status(200).json(
    new apiResponse(200, user.cart, "Product added to cart")
  );
});

export const updateCartQuantity = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) return next(new errorHandler(400, "Quantity must be at least 1"));

  const user = await User.findById(userId);
  const item = user.cart.find((item) => item.productId.toString() === productId);

  if (!item) return next(new errorHandler(404, "Product not in cart"));

  item.quantity = quantity;
  await user.save();

  res.status(200).json(new apiResponse(200, user.cart, "Cart quantity updated"));
});



export const removeFromCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const user = await User.findById(userId);

  if (!user.cart.includes(productId)) {
    return next(new errorHandler(404, "Product not found in cart"));
  }

  user.cart = user.cart.filter(itemId => itemId.toString() !== productId);
  await user.save();

  return res.status(200).json(
    new apiResponse(200, user.cart, "Product removed from cart")
  );
});

export const getMyCart = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("cart");

  return res.status(200).json(
    new apiResponse(200, user.cart, "Cart fetched successfully")
  );
});
export const clearCart = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save();
  return res.status(200).json(
    new apiResponse(200, null, "Cart cleared successfully")
  );
}
);
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("orders");
  if (!user) {
    return next(new errorHandler(404, "User not found"));
  }
  return res.status(200).json(
    new apiResponse(200, user.orders, "Orders fetched successfully")
  );
}
);    