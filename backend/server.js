// // const express = require("express");
// // const mongoose = require("mongoose");
// // require("dotenv").config();
// // const userRoutes = require("./routes/userRoutes");
// // const accommodationRoutes = require("./routes/accommodationRoutes");
// // const { notFound, errorHandler } = require("./middleware/errorMiddleware");
// // const cors = require("cors");
// // const app = express();

// // // Middleware
// // app.use(express.json());
// // app.use(notFound);
// // app.use(errorHandler);
// // app.use(cors());
// // // MongoDB connection
// // const connectDB = async () => {
// //     try {
// //       await mongoose.connect(process.env.MONGO_URI);
// //       console.log("MongoDB Connected");
// //     } catch (err) {
// //       console.error("Connection error:", err);
// //       process.exit(1); // Stop server if DB fails
// //     }
// //   };
  
// //   connectDB();

// // // Test route
// // app.get("/", (req, res) => res.send("API Running"));

// // // API routes
// // app.use("/api/users", userRoutes);
// // app.use("/api/accommodations", accommodationRoutes);

// // // 404 handler
// // app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// // // Global error handler
// // app.use((err, req, res, next) => {
// //   console.error("GLOBAL ERROR:", err);
// //   res.status(500).json({ message: "Server error" });
// // });

// // // Start server
// // const startServer = () => {
// //   try {
// //     const PORT = process.env.PORT || 5000;
// //     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// //   } catch (err) {
// //     console.error("Server failed to start:", err);
// //   }
// // };
// // startServer();

// const express = require("express");
// const mongoose = require("mongoose");
// const path = require("path");
// require("dotenv").config();
// const cors = require("cors");
// const upload = require("./middleware/upload");

// const userRoutes = require("./routes/userRoutes");
// const accommodationRoutes = require("./routes/accommodationRoutes");
// const reservationRoutes = require("./routes/reservationRoutes");
// const reviewRoutes = require("./routes/reviewRoutes");
// const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// // Serve uploaded images statically
// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "uploads"))
// );

// // API routes
// // app.use("/api/users", userRoutes);
// // // Attach multer here so it always processes multipart/form-data for this path
// // app.use("/api/accommodations", upload.array("images", 10), accommodationRoutes);
// // app.use("/api/reservations", reservationRoutes);
// // app.use("/api/reviews", reviewRoutes);

// app.use("/api/users", userRoutes);
// app.use("/api/accommodations", upload.array("images", 10), accommodationRoutes);
// app.use("/api/reservations", reservationRoutes);
// app.use("/api/reviews", reviewRoutes);

// app.get("/api", (req, res) => res.send("API Running"));


// // In production, serve the React build as well
// // if (process.env.NODE_ENV === "production") {
// //   const buildPath = path.join(__dirname, "..", "build");
// //   app.use(express.static(buildPath));

// //   app.use((req, res) => {
// //     res.sendFile(path.join(buildPath, "index.html"));
// //   });
// // }

// if (process.env.NODE_ENV === "production") {
//   const buildPath = path.join(__dirname, "..", "build");

//   app.use(express.static(buildPath));

//   // Catch-all AFTER API routes
//   app.use((req, res) => {
//     res.sendFile(path.join(buildPath, "index.html"));
//   });
// }

// // Test route
// app.get("/", (req, res) => res.send("API Running"));

// // 404 handler (for unmatched routes)
// app.use(notFound);

// // Global error handler
// app.use(errorHandler);

// // MongoDB connection
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("MongoDB Connected");
//   } catch (err) {
//     console.error("Connection error:", err);
//     process.exit(1);
//   }
// };

// connectDB();

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();
const cors = require("cors");

const upload = require("./middleware/upload");
const userRoutes = require("./routes/userRoutes");
const accommodationRoutes = require("./routes/accommodationRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/users", userRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/reviews", reviewRoutes);

// Only attach multer on POST/PUT routes that need file upload
app.use("/api/accommodations", accommodationRoutes);

// Test route
app.get("/api", (req, res) => res.send("API Running"));

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  const buildPath = path.resolve(__dirname, "..", "build");
  app.use(express.static(buildPath));
  app.get("*", (req, res) => res.sendFile(path.join(buildPath, "index.html")));
}

// 404 handler (after all routes)
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
};

startServer();