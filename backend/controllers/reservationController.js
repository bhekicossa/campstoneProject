const Reservation = require("../models/Reservation");
const Accommodation = require("../models/Accommodation");

// CREATE RESERVATION
exports.createReservation = async (req, res) => {
  try {
    const { accommodationId, checkIn, checkOut } = req.body;

    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can book" });
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const accommodation = await Accommodation.findById(accommodationId);

    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    // Prevent host booking their own listing
    if (accommodation.host.toString() === req.user.userId) {
      return res.status(400).json({ message: "Cannot book your own listing" });
    }

    // Check for overlapping reservations
    const overlapping = await Reservation.findOne({
      accommodation: accommodationId,
      status: "booked",
      $or: [
        {
          checkIn: { $lt: checkOut },
          checkOut: { $gt: checkIn },
        },
      ],
    });

    if (overlapping) {
      return res.status(400).json({ message: "Dates already booked" });
    }

    // Calculate total price
    const nights =
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

    const totalPrice = nights * accommodation.pricePerNight;

    const reservation = await Reservation.create({
      accommodation: accommodationId,
      guest: req.user.userId,
      checkIn,
      checkOut,
      totalPrice,
    });

    res.status(201).json(reservation);
  } catch (err) {
    console.error("RESERVATION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelReservation = async (req, res) => {
    try {
      const reservation = await Reservation.findById(req.params.id)
        .populate("accommodation");
  
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }
  
      if (reservation.status === "cancelled") {
        return res.status(400).json({ message: "Already cancelled" });
      }
  
      const isGuest =
        reservation.guest.toString() === req.user.userId;
  
      const isHost =
        reservation.accommodation.host.toString() === req.user.userId;
  
      const isAdmin = req.user.role === "admin";
  
      if (!isGuest && !isHost && !isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
  
      reservation.status = "cancelled";
      await reservation.save();
  
      res.json({ message: "Reservation cancelled" });
    } catch (err) {
      console.error("CANCEL ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  };


  exports.getMyReservations = async (req, res) => {
    try {
      let reservations;
  
      if (req.user.role === "user") {
        reservations = await Reservation.find({
          guest: req.user.userId,
        }).populate("accommodation");
      } 
      
      else if (req.user.role === "host") {
        const accommodations = await Accommodation.find({
          host: req.user.userId,
        }).select("_id");
  
        const ids = accommodations.map(acc => acc._id);
  
        reservations = await Reservation.find({
          accommodation: { $in: ids },
        })
          .populate("guest")
          .populate("accommodation");
      } 
      
      else if (req.user.role === "admin") {
        reservations = await Reservation.find()
          .populate("guest")
          .populate("accommodation");
      }
  
      res.json(reservations);
    } catch (err) {
      console.error("GET RESERVATIONS ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  };