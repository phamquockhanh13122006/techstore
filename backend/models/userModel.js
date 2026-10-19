const { User } = require("./schemas");

exports.findByEmail = (email) =>
  User.findOne({ email: String(email).toLowerCase() });

exports.findById = (id) => User.findOne({ id });

exports.findByIds = (ids) => User.find({ id: { $in: ids } });

exports.create = async ({ name, email, passwordHash }) => {
  const last = await User.findOne().sort({ id: -1 });
  return User.create({
    id: last ? last.id + 1 : 1,
    name,
    email,
    passwordHash,
    role: "user",
  });
};
