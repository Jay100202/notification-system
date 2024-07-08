const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error in user registration." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await User.updateOne({ _id: user._id }, { $set: { connected: true } });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("User logged in");
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error during login." });
  }
};
