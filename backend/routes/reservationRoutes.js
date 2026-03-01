const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, reservationController.getMyReservations);
router.post("/", protect, reservationController.createReservation);
router.patch("/:id/cancel", protect, reservationController.cancelReservation);

module.exports = router;
