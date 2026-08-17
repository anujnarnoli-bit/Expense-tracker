require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

app.use(cors());
app.use(express.json()); // req.body mein JSON data padhne ke liye

// Routes mount karo
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

const PORT = process.env.PORT || 5000;

// Pehle MongoDB se connect karo, phir hi server start karo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server chal raha hai port ${PORT} par`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
