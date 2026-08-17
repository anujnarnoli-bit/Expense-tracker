const express = require("express");
const Transaction = require("../models/Transaction");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Yeh sabhi routes login karne ke baad hi accessible hain
router.use(protect);

// GET /api/transactions  -> saare transactions laao (category/date filter ke sath)
router.get("/", async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    const filter = { user: req.userId };

    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/transactions -> naya income/expense add karo
router.post("/", async (req, res) => {
  try {
    const { type, category, amount, date, note } = req.body;
    const transaction = await Transaction.create({
      user: req.userId,
      type,
      category,
      amount,
      date,
      note,
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/transactions/:id -> existing transaction update karo
router.put("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!transaction) return res.status(404).json({ message: "Transaction nahi mila" });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/transactions/:id -> transaction delete karo
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!transaction) return res.status(404).json({ message: "Transaction nahi mila" });
    res.json({ message: "Delete ho gaya" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
