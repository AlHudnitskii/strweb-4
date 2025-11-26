const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const authenticateToken = require("../middleware/authMiddleware");


router.get("/", async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ order: 1 });
        res.json({ categories });
    } catch (error) {
        console.error("Error to get categories:", error);
        res.status(500).json({ error: "Server error" });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json(category);
    } catch (error) {
        console.error("Error getting category:", error);
        res.status(500).json({ error: "Server error" });
    }
});


router.post("/", authenticateToken, async (req, res) => {
    try {
        const { name, description, slug, order } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ error: "Name and slug are required" });
        }

        const category = await Category.create({ name, description, slug, order });

        res.status(201).json({ message: "Category created", category });
    } catch (error) {
        console.error("Error creating category:", error);
        if (error.code === 11000) {
            return res.status(400).json({ error: "Category with this name or slug already exists" });
        }
        res.status(500).json({ error: "Server error" });
    }
});


router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const { name, description, slug, order, isActive } = req.body;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, slug, order, isActive },
            { new: true, runValidators: true }
        );

        if (!category) {
        return res.status(404).json({ error: "Category not found" });
        }

        res.json({ message: "Category updated", category });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ error: "Server error" });
    }
});


router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
        return res.status(404).json({ error: "Category not found" });
        }

        res.json({ message: "Category deleted" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;