const Accommodation = require("../models/Accommodation");

// CREATE
exports.createAccommodation = async (req, res) => {
  try {
    // Multer populates req.body for multipart/form-data; fall back to empty object
    const body = req.body || {};
    const { title, description, location, pricePerNight, guests } = body;

    const pricePerNightNum = Number(pricePerNight);
    const guestsNum = Number(guests);

    // Field-level validation so the client can show exactly what is missing
    const missingFields = [];
    if (!title?.trim()) missingFields.push("title");
    if (!description?.trim()) missingFields.push("description");
    if (!location?.trim()) missingFields.push("location");
    if (pricePerNight === undefined || pricePerNight === "" || Number.isNaN(pricePerNightNum)) {
      missingFields.push("pricePerNight");
    }
    if (guests === undefined || guests === "" || Number.isNaN(guestsNum)) {
      missingFields.push("guests");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `The following field(s) are required or invalid: ${missingFields.join(
          ", "
        )}`,
        fields: missingFields,
      });
    }

    const imagePaths =
      Array.isArray(req.files) && req.files.length > 0
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : [];

    const accommodation = await Accommodation.create({
      title,
      description,
      location,
      pricePerNight: pricePerNightNum,
      guests: guestsNum,
      host: req.user.userId, // comes from JWT middleware
      images: imagePaths,
    });

    res.status(201).json(accommodation);
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// GET ONE
exports.getAccommodationById = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(
      req.params.id
    ).populate("host", "username email");

    if (!accommodation) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(accommodation);
  } catch (err) {
    console.error("GET ONE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllAccommodations  = async (req, res) => {
    try {
      const { minPrice, maxPrice, location } = req.query;
  
      let filter = {};
  
      if (minPrice || maxPrice) {
        filter.pricePerNight = {};
        if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
        if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
      }
  
      if (location) {
        filter.location = { $regex: location, $options: "i" };
      }
  
      const accommodations = await Accommodation.find(filter);
  
      res.json(accommodations);
    } catch (err) {
      console.error("GET ACCOMMODATIONS ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  };


// UPDATE
// exports.updateAccommodation = async (req, res) => {
//     try {
//       const accommodation = await Accommodation.findById(req.params.id);
  
//       if (!accommodation) {
//         return res.status(404).json({ message: "Not found" });
//       }
  
//       // Ownership check
//       if (
//         accommodation.host.toString() !== req.user.userId &&
//         req.user.role !== "admin"
//       ) {
//         return res.status(403).json({ message: "Not authorized" });
//       }
  
//       const updated = await Accommodation.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true, runValidators: true }
//       );
  
//       res.json(updated);
//     } catch (err) {
//       console.error("UPDATE ERROR:", err);
//       res.status(500).json({ message: "Server error" });
//     }
//   };
exports.updateAccommodation = async (req, res, next) => {
    const accommodation = await Accommodation.findById(req.params.id);
  
    if (!accommodation) {
      res.status(404);
      throw new Error("Accommodation not found");
    }
  
    if (accommodation.host.toString() !== req.user.userId) {
      res.status(403);
      throw new Error("Not authorized to modify this listing");
    }
  
    const updated = await Accommodation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
  
    res.json({ success: true, data: updated });
  };
  // DELETE
  exports.deleteAccommodation = async (req, res) => {
    try {
      const accommodation = await Accommodation.findById(req.params.id);
  
      if (!accommodation) {
        return res.status(404).json({ message: "Not found" });
      }
  
      if (
        accommodation.host.toString() !== req.user.userId &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }
  
      await accommodation.deleteOne();
  
      res.json({ message: "Deleted successfully" });
    } catch (err) {
      console.error("DELETE ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  };