const express = require("express");
const router = express.Router();

const accommodationController = require("../controllers/accommodationController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes
router.get("/", accommodationController.getAllAccommodations);
router.get("/:id", accommodationController.getAccommodationById);

// Protected route (multer is applied at server level)
router.post(
  "/",
  protect,
  authorize("host", "admin"),
  accommodationController.createAccommodation
);

router.put(
  "/:id",
  protect,
  authorize("host", "admin"),
  accommodationController.updateAccommodation
);

router.delete(
  "/:id",
  protect,
  authorize("host", "admin"),
  accommodationController.deleteAccommodation
);

module.exports = router;
