import Stripe from 'stripe';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandle.js';
import { errorHandler } from '../utils/errorHandle.js';
import Order from '../models/order.models.js';
import Payment from '../models/payment.models.js';
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. Create Payment Intent (simulate, no real Stripe call)
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, buyerId, product, sellerName } = req.body;

  if (!amount || !buyerId || !product || !sellerName) {
    return res.status(400).json(
      new apiResponse(400, null, 'Missing required fields: amount, buyerId, product, sellerName')
    );
  }

  // Simulate PaymentIntent creation by making a dummy Payment record
  const payment = await Payment.create({
    paymentIntentId: "dummy_" + Date.now(), // dummy id
    amount,
    currency: "inr",
    status: "Succeeded",
    buyer: buyerId,
  });

  // Create order linked to this dummy payment
  const order = await Order.create({
    product,
    payment: payment._id,
    buyer: buyerId,
    sellerName,
  });

  return res.status(201).json(
    new apiResponse(201, { order, payment }, 'Order placed successfully (payment simulated)')
  );
});

// 2. Save Order after Successful Payment
// You can keep this as is for when real payment is integrated
export const saveOrderAfterPayment = asyncHandler(async (req, res) => {
  const {
    paymentIntentId,
    amount,
    currency,
    buyerId,
    product,
    sellerName,
  } = req.body;

  if (!paymentIntentId || !amount || !buyerId || !product || !sellerName) {
    return errorHandler(res, 400, 'Missing required fields');
  }

  const payment = await Payment.create({
    paymentIntentId,
    amount,
    currency,
    status: 'Succeeded',
    buyer: buyerId,
  });

  const order = await Order.create({
    product,
    payment: payment._id,
    buyer: buyerId,
    sellerName,
  });

  return apiResponse(res, 201, 'Order placed successfully', { order });
});

// 3. Get Orders (Buyer or Seller) remains unchanged
export const getMyOrders = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const role = req.user.role;
    const fullName = req.user.fullName;
  
    if (!userId || !role) {
      return errorHandler(res, 400, "Missing userId or role");
    }
  
    let orders = [];
  
    if (role === "seller") {
      if (!fullName) {
        return errorHandler(res, 400, "Seller full name is required");
      }
  
      orders = await Order.find({ sellerName: fullName })
        .populate("product")
        .populate("payment")
        .populate("buyer", "fullName email");
    } else {
      orders = await Order.find({ buyer: userId })
        .populate("product")
        .populate("payment")
        .populate("buyer", "fullName email");
    }
  
    return res.status(201).json(
        new apiResponse(201, "Orders fetched successfully", { orders }));
  });
  
