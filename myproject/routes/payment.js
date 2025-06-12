// routes/payment.js
import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Razorpay instance
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /createOrder
router.post("/createOrder", async (req, res) => {
  const options = {
    amount: 50000, // ₹500 in paise
    currency: "INR",
    receipt: "order_rcptid_11",
  };

  try {
    const order = await instance.orders.create(options);
    console.log("Order created:", order);
    res.json(order);
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).send("Error creating order");
  }
});

export default router;
