// file: testAuth.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// ------------------ MongoDB Setup ------------------


mongoose.connect("mongodb://127.0.0.1:27017/testAuthDB") // no extra options
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// ------------------ User Schema ------------------
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
});

const User = mongoose.model("User", userSchema);

// ------------------ Test Function ------------------
const testAuth = async () => {
  try {
    const plainPassword = "TestPassword123!"; // exact password you want
    const email = "rethabile@test.com";

    // Remove old test user if exists
    await User.deleteOne({ email });

    // Hash the password and create user
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    const user = await User.create({
      username: "Rethabile",
      email,
      password: hashedPassword,
    });

    console.log("User registered:");
    console.log(user);

    // ------------------ Login Simulation ------------------
    const loginPassword = "TestPassword123!"; // exact same password
    const isMatch = await bcrypt.compare(loginPassword, user.password);
    console.log("Login password match:", isMatch);

    // Close MongoDB connection
    await mongoose.connection.close();
  } catch (err) {
    console.error("TEST ERROR:", err);
  }
};

testAuth();