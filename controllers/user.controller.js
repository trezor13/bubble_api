const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const registerUser = asyncHandler(async (req, res) => {
  const { username, lastname, firstname, email, cpassword, password } =
    req.body;
  if (
    !username ||
    !lastname ||
    !firstname ||
    !email ||
    !password ||
    !cpassword
  ) {
    return res.json({
      message: "All credentials are required!",
      status: 400,
    });
  }

  const eu = await User.findOne({ email });
  if (eu) {
    return res.json({ message: "User already exists...", status: 400 });
  }

  if (password != cpassword) {
    return res.json({
      message: "Confirm password to continue...",
      status: 400,
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hPass = await bcrypt.hash(password, salt);

  // create the user
  const u = await User.create({
    username,
    firstname,
    lastname,
    password: hPass,
    email,
  });

  if (u) {
    return res.json({
      message: "User created successfully",
      status: 201,
      token: generateToken(u._id),
    });
  } else {
    return res.json({
      message: "Error while creating the user...",
      status: 500,
    });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({
      message: "All credentials are required!",
      status: 400,
    });
  }

  const u = await User.findOne({ email });
  if (!u) {
    return res.json({ message: "Invalid email or password!", status: 400 });
  }
  if (await bcrypt.compare(password, u.password)) {
    return res.json({
      message: "Logged in!",
      token: generateToken(u._id),
      status: 200,
    });
  } else {
    return res.json({ message: "Invalid email or password!", status: 400 });
  }
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

module.exports = {
  loginUser,
  registerUser,
};
