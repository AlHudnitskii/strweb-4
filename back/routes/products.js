const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const authenticateToken = require("../middleware/authMiddleware");


router.get("/", async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        let filter = { status: "active" };

        if (search) {
            filter.$text = { $search: search };
        }

        if (category) {
        filter.category = category;
        }

        if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

        const products = await Product.find(filter)
            .populate("category", "name slug")
            .sort(sortOptions)
            .lean();

        res.json({ products, count: products.length });
    } catch (error) {
        console.error("Error to get products:", error);
        res.status(500).json({ error: "Server error" });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category", "name slug");

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        console.error("Error getting product:", error);
        res.status(500).json({ error: "Server error" });
    }
});


router.post("/", authenticateToken, async (req, res) => {
    try {
        const { name, description, price, discountPrice, category, stock, brand, images, tags } = req.body;

        if (!name || !description || !price || !category) {
            return res.status(400).json({ error: "Name, description, price, and category are required" });
        }

        if (price < 0) {
            return res.status(400).json({ error: "Price cannot be negative" });
        }

        if (discountPrice && discountPrice >= price) {
            return res.status(400).json({ error: "Discount price must be less than the regular price" });
        }

        const product = await Product.create({
            name,
            description,
            price,
            discountPrice,
            category,
            stock: stock || 0,
            brand,
            images: images || [],
            tags: tags || [],
            createdBy: req.user.id,
        });

        await product.populate("category", "name slug");

        res.status(201).json({ message: "Product created", product });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Server error" });
    }
});


router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const { name, description, price, discountPrice, category, stock, brand, images, tags, status } = req.body;

        if (price && price < 0) {
            return res.status(400).json({ error: "Price cannot be negative" });
        }

        if (discountPrice && price && discountPrice >= price) {
            return res.status(400).json({ error: "Discount price must be less than the regular price" });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                price,
                discountPrice,
                category,
                stock,
                brand,
                images,
                tags,
                status,
            },
            { new: true, runValidators: true }
        ).populate("category", "name slug");

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product updated", product });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Server error" });
    }
});


router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product deleted" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;