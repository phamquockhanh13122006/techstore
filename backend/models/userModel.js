const { User } = require("./schemas");
const { nextId } = require("./counterModel");

exports.findByEmail = (email) =>
  User.findOne({ email: String(email).toLowerCase() });

exports.findById = (id) => User.findOne({ id });

exports.findByIds = (ids) => User.find({ id: { $in: ids } });

exports.create = async ({ name, email, passwordHash }) => {
  const id = await nextId("users", User);
  return User.create({
    id,
    name,
    email,
    passwordHash,
    role: "user",
  });
};
