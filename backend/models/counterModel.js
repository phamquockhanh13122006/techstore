const { Counter } = require("./schemas");

// Cấp id kế tiếp một cách nguyên tử ($inc), nên hai yêu cầu cùng lúc không bao giờ nhận trùng id.
// Lần dùng đầu tiên, bảng đếm được khởi tạo bằng id lớn nhất đang có trong dữ liệu cũ.
async function nextId(name, Model) {
  const bump = () =>
    Counter.findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { new: true });

  let counter = await bump();
  if (counter) return counter.seq;

  const last = await Model.findOne().sort({ id: -1 });
  try {
    await Counter.updateOne(
      { _id: name },
      { $setOnInsert: { seq: last ? last.id : 0 } },
      { upsert: true }
    );
  } catch (err) {
    // Hai yêu cầu cùng khởi tạo một lúc: yêu cầu thua bỏ qua lỗi trùng _id
    if (err.code !== 11000) throw err;
  }
  counter = await bump();
  return counter.seq;
}

// Đặt bảng đếm bằng đúng id lớn nhất (dùng sau khi seed nạp lại dữ liệu)
async function syncCounter(name, Model) {
  const last = await Model.findOne().sort({ id: -1 });
  await Counter.updateOne(
    { _id: name },
    { $set: { seq: last ? last.id : 0 } },
    { upsert: true }
  );
}

module.exports = { nextId, syncCounter };
