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

module.exports = { User, Product, Order };
