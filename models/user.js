const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const passportLocalMongoose = require("passport-local-mongoose");
const randToken = require("rand-token");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "alumni"],
    default: "student",
  },
  graduationYear: {
    type: Number,
    required: true,
  },
  major: {
    type: String,
    required: true,
  },
  job: {
    type: String,
  },
  company: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  zipCode: {
    type: Number,
    min: 10000,
    max: 99999,
  },
  bio: {
    type: String,
  },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  interests: [{ type: String }],
  apiToken: {
    type: String,
  },
});
// Hashes the user's password before saving
userSchema.pre("save", function (next) {
  let user = this;
  bcrypt
    .hash(user.password, 10)
    .then((hash) => {
      user.password = hash;
      next();
    })
    .catch((error) => {
      console.log(`Error in hashing password: ${error.message}`);
      next(error);
    });
});
// Method for comparing passwords
userSchema.methods.passwordComparison = function (inputPassword) {
  let user = this;
  return bcrypt.compare(inputPassword, user.password);
};
// Plugin for passport-local-mongoose
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });
// Generates an API token if it doesn't exist before saving
userSchema.pre("save", function (next) {
  let user = this;
  if (!user.apiToken) user.apiToken = randToken.generate(16);
  next();
});
module.exports = mongoose.model("User", userSchema);