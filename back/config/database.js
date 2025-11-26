const mongoose = require("mongoose")
const dotenv = require("dotenv")

dotenv.config()

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/online_shop"; 

const connectDB = async() => {
    try {
        await mongoose.connect(MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        console.log("Error to connect MongoDB:", error.message);
        process.exit(1);
    }
};

mongoose.connection.on("connected", () => {
  console.log("📦 Mongoose подключен к MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Ошибка Mongoose:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("📤 Mongoose отключен от MongoDB");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB соединение закрыто через app termination");
  process.exit(0);
});

module.exports = connectDB;     