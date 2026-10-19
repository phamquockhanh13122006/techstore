require("dotenv").config();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { User, Product } = require("./models/schemas");

async function seed() {
  await connectDB();

  const products = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data/products.json"), "utf8")
  );
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Đã nạp ${products.length} sản phẩm`);

  const admin = await User.findOne({ email: "admin@gmail.com" });
  if (!admin) {
    const last = await User.findOne().sort({ id: -1 });
    await User.create({
      id: last ? last.id + 1 : 1,
      name: "Admin",
      email: "admin@gmail.com",
      passwordHash: bcrypt.hashSync("123456", 10),
      role: "admin",
    });
    console.log("Đã tạo tài khoản admin@gmail.com / 123456");
  } else {
    console.log("Tài khoản admin đã có sẵn");
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
