const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../data/users.json");

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeAll(users) {
  fs.writeFileSync(FILE, JSON.stringify(users, null, 2));
}

exports.findByEmail = (email) =>
  readAll().find((u) => u.email.toLowerCase() === String(email).toLowerCase());

exports.findById = (id) => readAll().find((u) => u.id === id);

exports.create = ({ name, email, passwordHash }) => {
  const users = readAll();
  const user = {
    id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    name,
    email,
    passwordHash,
    role: "user",
  };
  users.push(user);
  writeAll(users);
  return user;
};
