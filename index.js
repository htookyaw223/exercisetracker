const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let UserSchema = new mongoose.Schema({
  username: String,
  log: [
    {
      description: String,
      duration: Number,
      date: Date,
    },
  ],
});
let User = mongoose.model("User", UserSchema);

app.post("/api/users", async (req, res) => {
  const username = req.body.username;
  const user = new User({ username: username, log: [] });
  const result = await user.save();
  res.json({ username: result.username, _id: result._id });
});
app.post("/api/users/:_id/exercises", async (req, res) => {
  const userId = req.params._id;
  const description = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date;
  const user = await User.findById(userId);
  const log = {
    description: description,
    duration: duration,
    date: date ?? new Date(),
  };
  user.log.push(log);
  await user.save();
  res.json({ username: user.username, _id: user._id, log: user.log });
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;
  const user = await User.findById(userId);
  const log = user.log;
  let result = log;
  if (from) {
    result = result.filter(log => log.date > new Date(from));
  }
  if (to) {
    result = result.filter(log => log.date < new Date(to));
  }
  if (limit) {
    result = result.slice(0, limit);
  }
  res.json({
    username: user.username,
    _id: user._id,
    count: result.length,
    log: result,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
