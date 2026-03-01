

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // your Mongoose model

// Constants – store secrets in environment variables in production
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXP = "15m";
const REFRESH_TOKEN_EXP = "7d";
const DEFAULT_ROLE = "user"; // never trust client input

const handleError = (res, statusCode = 500, message = "Something went wrong") => {
    return res.status(statusCode).json({ error: message });
  };

// ---------------- Utility Functions ----------------
// Relaxed password rule for this project: at least 6 characters.
// (You can tighten this again later if needed.)
const isStrongPassword = (password) => {
  return typeof password === "string" && password.length >= 6;
};

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ userId, role }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXP });
  const refreshToken = jwt.sign({ userId, role }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXP });
  return { accessToken, refreshToken };
};

// ---------------- Register ----------------

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !username.trim())
      return handleError(res, 400, "Username required");

    if (!email || !email.trim() || !email.includes("@"))
      return handleError(res, 400, "Valid email required");

    if (!password)
      return handleError(res, 400, "Password required");

    if (!isStrongPassword(password)) {
      return handleError(
        res,
        400,
        "Password must be 8+ chars with uppercase, lowercase, number, and symbol"
      );
    }

    // Whitelist roles
    const allowedRoles = ["user", "host"];
    const safeRole = allowedRoles.includes(role) ? role : "user";

    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      // Let the User model's pre('save') hook hash the password once
      password,
      role: safeRole,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    // Duplicate email
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return handleError(res, 400, "Email already in use");
    }

    console.error("REGISTER ERROR:", err);
    return handleError(res, 500, "Server error");
  }
};

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (!user) return handleError(res, 401, "Invalid credentials");
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return handleError(res, 401, "Invalid credentials");
  
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
  
      res.json({
        message: "Login successful",
        token,
        user: { id: user._id, username: user.username, role: user.role },
      });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      handleError(res, 500, "Server error");
    }
  };

// ----------------  Logout ----------------
exports.logout = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return handleError(res, 400, "Invalid request");

    user.refreshToken = null;
    await user.save();

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    handleError(res, 500, "Server error");
  }
};