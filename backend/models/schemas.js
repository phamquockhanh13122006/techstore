const mongoose = require("mongoose");

// Bỏ _id và __v khi trả JSON, để API giữ nguyên dạng cũ
const options = {
  versionKey: false,
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      return ret;
    },
  },
};

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      id: { type: Number, unique: true },
      name: String,
      email: { type: String, unique: true, lowercase: true },
      passwordHash: String,
      role: { type: String, default: "user" },
    },
    options
  )
);

const Product = mongoose.model(
  "Product",
  new mongoose.Schema(
    {
      id: { type: Number, unique: true },
      name: String,
      category: String,
      price: Number,
      image: String,
      description: { type: String, default: "" },
      stock: { type: Number, default: 0, min: 0 },
    },
    options
  )
);

const Order = mongoose.model(
  "Order",
  new mongoose.Schema(
    {
      id: { type: Number, unique: true },
      userId: Number,
      items: [
        {
          _id: false,
          productId: Number,
          name: String,
          price: Number,
          quantity: Number,
        },
      ],
      total: Number,
      shippingAddress: {
           fullName: String,
           phone: String,
           address: String,
      },
      paymentMethod: {
        type: String,
        enum: ["cod", "bank"],
        
      },
      status: {
        type: String,
        enum: ["pending", "shipping", "done", "cancelled"],
        default: "pending",
      },
      createdAt: { type: Date, default: Date.now },
    },
    options
  )
);

// Bảng đếm để cấp id tăng dần, mỗi tên (users, products, orders) là một dòng
const Counter = mongoose.model(
  "Counter",
  new mongoose.Schema(
    { _id: String, seq: { type: Number, default: 0 } },
    { versionKey: false }
  )
);

module.exports = { User, Product, Order, Counter };
