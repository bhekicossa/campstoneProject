const Review = require("../models/Review");
const Accommodation = require("../models/Accommodation");

exports.createReview = async (req, res) => {
  try {
    const { accommodationId, rating, comment } = req.body;

    if (!accommodationId || !rating) {
      return res.status(400).json({ message: "Accommodation and rating required" });
    }

    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    const existing = await Review.findOne({
      accommodation: accommodationId,
      user: req.user.userId,
    });
    if (existing) {
      return res.status(400).json({ message: "You already reviewed this listing" });
    }

    const review = await Review.create({
      accommodation: accommodationId,
      user: req.user.userId,
      rating: Number(rating),
      comment: comment || "",
    });

    const populated = await Review.findById(review._id)
      .populate("user", "username");

    res.status(201).json(populated);
  } catch (err) {
    console.error("REVIEW CREATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getReviewsByAccommodation = async (req, res) => {
  try {
    const reviews = await Review.find({ accommodation: req.params.id })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("GET REVIEWS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
