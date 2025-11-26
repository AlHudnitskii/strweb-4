const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/online_shop";

const seedData = async () => {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});
    console.log("Old data deleted");

    const adminUser = await User.create({
      username: "admin",
      password: "admin123",
      email: "admin@shop.com",
      role: "admin",
    });

    const regularUser = await User.create({
      username: "user",
      password: "user123",
      email: "user@shop.com",
      role: "user",
    });

    console.log("Users created");

    const electronicsCategory = await Category.create({
      name: "Electronics",
      description: "Electronic devices and gadgets",
      slug: "electronics",
      order: 1,
    });

    const clothingCategory = await Category.create({
      name: "Clothing",
      description: "Fashion and apparel",
      slug: "clothing",
      order: 2,
    });

    const booksCategory = await Category.create({
      name: "Books",
      description: "Books and magazines",
      slug: "books",
      order: 3,
    });

    const homeCategory = await Category.create({
      name: "Home & Garden",
      description: "Home improvement and garden supplies",
      slug: "home-garden",
      order: 4,
    });

    const sportsCategory = await Category.create({
      name: "Sports",
      description: "Sports equipment and accessories",
      slug: "sports",
      order: 5,
    });

    console.log("Categories created");

    const products = await Product.create([
      {
        name: "iPhone 15 Pro",
        description: "Latest Apple smartphone with advanced camera system and A17 Pro chip",
        price: 89990,
        discountPrice: 79990,
        category: electronicsCategory._id,
        stock: 50,
        brand: "Apple",
        sku: "IP15PRO-256-BLK",
        rating: 4.8,
        reviewsCount: 234,
        tags: ["smartphone", "apple", "5g"],
        featured: true,
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "Samsung Galaxy S24",
        description: "Powerful Android smartphone with AI features",
        price: 74990,
        category: electronicsCategory._id,
        stock: 30,
        brand: "Samsung",
        sku: "SGS24-128-WHT",
        rating: 4.6,
        reviewsCount: 189,
        tags: ["smartphone", "samsung", "android"],
        featured: true,
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "MacBook Air M3",
        description: "Thin and light laptop with incredible performance",
        price: 129990,
        discountPrice: 119990,
        category: electronicsCategory._id,
        stock: 15,
        brand: "Apple",
        sku: "MBA-M3-256-SLV",
        rating: 4.9,
        reviewsCount: 412,
        tags: ["laptop", "apple", "m3"],
        featured: true,
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "Sony WH-1000XM5",
        description: "Industry-leading noise canceling wireless headphones",
        price: 29990,
        category: electronicsCategory._id,
        stock: 45,
        brand: "Sony",
        sku: "WH1000XM5-BLK",
        rating: 4.7,
        reviewsCount: 567,
        tags: ["headphones", "wireless", "noise-canceling"],
        featured: false,
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "Nike Air Max 270",
        description: "Comfortable running shoes with Max Air cushioning",
        price: 12990,
        category: sportsCategory._id,
        stock: 100,
        brand: "Nike",
        sku: "AM270-BLK-42",
        rating: 4.5,
        reviewsCount: 289,
        tags: ["shoes", "running", "nike"],
        featured: false,
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "Levi's 501 Jeans",
        description: "Classic straight fit jeans",
        price: 5990,
        category: clothingCategory._id,
        stock: 200,
        brand: "Levi's",
        sku: "501-BLUE-32",
        rating: 4.4,
        reviewsCount: 145,
        tags: ["jeans", "clothing", "levis"],
        featured: false,
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "The Lord of the Rings Box Set",
        description: "Complete trilogy in hardcover",
        price: 3990,
        discountPrice: 2990,
        category: booksCategory._id,
        stock: 80,
        brand: "HarperCollins",
        sku: "LOTR-BOX-EN",
        rating: 4.9,
        reviewsCount: 1234,
        tags: ["books", "fantasy", "tolkien"],
        featured: true,
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "Dyson V15 Detect",
        description: "Cordless vacuum cleaner with laser dust detection",
        price: 54990,
        category: homeCategory._id,
        stock: 20,
        brand: "Dyson",
        sku: "V15-DETECT-YLW",
        rating: 4.6,
        reviewsCount: 78,
        tags: ["vacuum", "cordless", "home"],
        featured: false,
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "Adidas Ultraboost 22",
        description: "Premium running shoes with Boost technology",
        price: 14990,
        category: sportsCategory._id,
        stock: 75,
        brand: "Adidas",
        sku: "UB22-WHT-42",
        rating: 4.7,
        reviewsCount: 312,
        tags: ["shoes", "running", "adidas"],
        featured: false,
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "PlayStation 5",
        description: "Next-gen gaming console",
        price: 49990,
        category: electronicsCategory._id,
        stock: 0,
        brand: "Sony",
        sku: "PS5-DISC-WHT",
        rating: 4.8,
        reviewsCount: 892,
        tags: ["gaming", "console", "playstation"],
        featured: true,
        status: "out_of_stock",
        createdBy: adminUser._id,
      },
      {
        name: "Canon EOS R6 Mark II",
        description: "Professional mirrorless camera",
        price: 179990,
        category: electronicsCategory._id,
        stock: 8,
        brand: "Canon",
        sku: "EOSR6M2-BODY",
        rating: 4.9,
        reviewsCount: 156,
        tags: ["camera", "photography", "professional"],
        featured: false,
        status: "active",
        createdBy: adminUser._id,
      },
      {
        name: "IKEA BILLY Bookcase",
        description: "Classic bookshelf, white",
        price: 2990,
        category: homeCategory._id,
        stock: 150,
        brand: "IKEA",
        sku: "BILLY-WHT-80",
        rating: 4.3,
        reviewsCount: 234,
        tags: ["furniture", "bookcase", "storage"],
        featured: false,
        status: "active",
        createdBy: adminUser._id,
      },
    ]);

    console.log(`Created ${products.length} products`);

    const order = await Order.create({
      user: regularUser._id,
      items: [
        {
          product: products[0]._id,
          name: products[0].name,
          quantity: 1,
          price: products[0].discountPrice || products[0].price,
          image: products[0].images[0],
        },
        {
          product: products[3]._id,
          name: products[3].name,
          quantity: 1,
          price: products[3].price,
          image: products[3].images[0],
        },
      ],
      shippingAddress: {
        fullName: "John Doe",
        phone: "+7 (999) 123-45-67",
        email: "user@shop.com",
        address: "123 Main Street, Apt 4B",
        city: "Moscow",
        postalCode: "101000",
        country: "Russia",
      },
      paymentMethod: "card",
      paymentStatus: "paid",
      paidAt: new Date(),
      itemsPrice: 109980,
      shippingPrice: 500,
      taxPrice: 0,
      totalPrice: 110480,
      status: "processing",
    });


    const cart = await Cart.create({
      user: regularUser._id,
      items: [
        {
          product: products[6]._id,
          quantity: 1,
          price: products[6].discountPrice || products[6].price,
        },
      ],
    });
    await mongoose.connection.close();

};

seedData();