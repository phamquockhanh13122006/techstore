const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../data/orders.json");

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeAll(orders) {
  fs.writeFileSync(FILE, JSON.stringify(orders, null, 2));
}

exports.create = (order) => {
  const orders = readAll();
  const newOrder = {
    id: orders.length ? Math.max(...orders.map((o) => o.id)) + 1 : 1,
    ...order,
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  writeAll(orders);
  return newOrder;
};

exports.findByUser = (userId) =>
  readAll()
    .filter((o) => o.userId === userId)
    .reverse();
    // ===== Dành cho admin =====
exports.findAll = () => readAll().reverse();

exports.updateStatus = (id, status) => {
  const orders = readAll();
  const order = orders.find((o) => o.id === Number(id));
  if (!order) return null;
  order.status = status;
  writeAll(orders);
  return order;
};
