const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const Order = require("./models/Order");


// Replace with your MongoDB connection string
mongoose.connect("mongodb://localhost:27017/posinglamp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
    console.log("✅ Connected to MongoDB");
});
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Initialize Razorpay
app.post("/posinglamp", async (req, res) => {
    const { paymentId, orderId, signature, amount, name, email, phone, address } = req.body;
  
    const secret = "5KDg4XBL9nhcCmxna7wWkm4J";
  
    // Verify the payment signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(orderId + "|" + paymentId)
      .digest("hex");
  
    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature!" });
    }
  
    try {
      // Save order to MongoDB
      const newOrder = new Order({ paymentId, orderId, signature, amount, name, email, phone, address });
      await newOrder.save();
  
      console.log("📦 Order saved:", newOrder);
      res.json({ success: true, message: "Order saved successfully!" });
    } catch (err) {
      console.error("❌ Error saving order:", err);
      res.status(500).json({ success: false, message: "Failed to save order to database." });
    }
  });

// ✅ Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);


    const crypto = require("crypto");
    const Order = require("./models/Order"); // Import the model

    app.post("/posinglamp", async (req, res) => {
        const { paymentId, orderId, signature, amount, name, email, phone, address } = req.body;

        const secret = "YOUR_SECRET_KEY";

        // Verify the payment signature
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(orderId + "|" + paymentId)
            .digest("hex");

        if (expectedSignature !== signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature!" });
        }

        try {
            // Save order to MongoDB
            const newOrder = new Order({ paymentId, orderId, signature, amount, name, email, phone, address });
            await newOrder.save();

            console.log("📦 Order saved:", newOrder);
            res.json({ success: true, message: "Order saved successfully!" });
        } catch (err) {
            console.error("❌ Error saving order:", err);
            res.status(500).json({ success: false, message: "Failed to save order to database." });
        }
    });





    const razorpay = new Razorpay({
        key_id: "rzp_test_4LFmIgq7fRIygo", // Replace with your key
        key_secret: "5KDg4XBL9nhcCmxna7wWkm4J"
    });

    // ✅ Create Order Route
    app.post("/create-order", async (req, res) => {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ error: "Amount is required" });
        }

        try {
            const order = await razorpay.orders.create({
                amount: amount, // amount in paise
                currency: "INR",
                receipt: "receipt_" + Math.floor(Math.random() * 1000000),
            });

            res.json({
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
            });
        } catch (err) {
            console.error("Error creating Razorpay order:", err);
            res.status(500).json({ error: "Failed to create Razorpay order" });
        }
    });
});
app.get("/orders", async (req, res) => {
    try {
      const orders = await Order.find();  // Get all orders from DB
      res.json(orders);  // Send them as JSON
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
app.get("/", (req, res) => {
    res.send("Hello from the server!");
  })  
  app.put("/orders/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    try {
      const result = await Order.findByIdAndUpdate(id, { status }, { new: true });
      res.json({ success: true, updated: result });
    } catch (err) {
      console.error("Failed to update status:", err);
      res.status(500).json({ success: false, error: "Failed to update status" });
    }
  });
  