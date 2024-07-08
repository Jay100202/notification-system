const jwt = require("jsonwebtoken");
const User = require("../models/user");

const checkRole = (roles) => async (req, res, next) => {
  if (!req.headers.authorization) {
    return res
      .status(401)
      .json({ message: "Authorization header is missing." });
  }

  console.log(req.headers.authorization);
  try {
    const parts = req.headers.authorization.split(" ");
    console.log("Parts", parts);
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.log("Malformed Authorization header", req.headers.authorization);
      return res
        .status(401)
        .json({ message: "Authorization header is malformed." });
    }
    const token = parts[1];
    console.log("token", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("dec", decoded);

    const user = await User.findById(decoded.userId);
    console.log("usss", user);

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Access denied." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Not authorized." });
  }
};

exports.checkRole = checkRole;
