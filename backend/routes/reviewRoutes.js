const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

router.get("/accommodation/:id", reviewController.getReviewsByAccommodation);
router.post("/", protect, reviewController.createReview);

module.exports = router;
