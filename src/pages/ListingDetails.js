import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const DEFAULT_AMENITIES = [
  "Garden view", "Kitchen", "Wi-Fi", "Pets allowed", "Washer", "Dryer",
  "Air conditioning", "Security cameras", "Refrigerator", "Free parking",
];

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const showAllAmenities = () => {
    Swal.fire({
      title: "Amenities",
      html: DEFAULT_AMENITIES.map(a => `<p>✓ ${a}</p>`).join(""),
      confirmButtonColor: "#ff385c",
    });
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const [listRes, revRes] = await Promise.all([
          api.get(`/accommodations/${id}`),
          api.get(`/reviews/accommodation/${id}`).catch(() => ({ data: [] })),
        ]);
        setListing(listRes.data);
        setReviews(revRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load listing");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const book = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!checkIn || !checkOut) {
      await Swal.fire({
        icon: "warning",
        title: "Select dates",
        text: "Please select check-in and check-out dates.",
        confirmButtonColor: "#ff385c",
      });
      return;
    }
    try {
      await api.post("/reservations", {
        accommodationId: id,
        checkIn,
        checkOut,
      });
      await Swal.fire({
        icon: "success",
        title: "Reservation confirmed",
        text: "Your booking has been confirmed. You won't be charged yet.",
        confirmButtonColor: "#ff385c",
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Booking failed",
        text: err.response?.data?.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#ff385c",
      });
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const res = await api.post("/reviews", {
        accommodationId: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviews((prev) => [res.data, ...prev]);
      setReviewForm({ rating: 5, comment: "" });
      await Swal.fire({
        icon: "success",
        title: "Review submitted",
        text: "Thank you for your review!",
        confirmButtonColor: "#ff385c",
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to submit review",
        confirmButtonColor: "#ff385c",
      });
    }
  };

  

  const SERVER_URL = "http://localhost:5000"; // adjust to your API domain

  const showAllPhotos = () => {
    if (!listing?.images?.length) {
      Swal.fire({
        title: "Photos",
        html: `<p style="text-align:left;">No photos uploaded yet for ${listing.location}.</p>`,
        confirmButtonColor: "#ff385c",
      });
      return;
    }

    const imagesHtml = listing.images
      .map(
        (url) =>
          `<img src="${SERVER_URL}${url}" style="width:100%; margin-bottom:8px; border-radius:8px;" />`
      )
      .join("");

    Swal.fire({
      title: "Photos",
      html: `<div style="max-height:60vh; overflow-y:auto;">${imagesHtml}</div>`,
      width: "80%",
      confirmButtonColor: "#ff385c",
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "var(--color-gray-800)" }}>
        Loading…
      </div>
    );
  }
  if (error && !listing) {
    return (
      <div style={{ padding: 24, color: "var(--color-primary)" }}>
        {error}
      </div>
    );
  }
  if (!listing) return null;

  const isHost = user && (listing.host?._id === user.id || listing.host === user.id);
  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
    : 0;
  const subtotal = nights * listing.pricePerNight;
  const cleaningFee = 20;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + cleaningFee + serviceFee;

  return (
    <div className="listing-detail">
      {/* <div className="listing-detail-hero" style={{ position: "relative" }}>
        {listing.location}
        <button
          type="button"
          className="airbnb-btn airbnb-btn-ghost"
          style={{ position: "absolute", bottom: 16, right: 16 }}
          onClick={showAllPhotos}
        >
          📷 Show all photos
        </button>
      </div> */}

      <div className="listing-detail-hero" style={{ position: "relative" }}>
        {/* Main Image */}
        {listing.images && listing.images.length > 0 ? (
          <img
            src={`http://localhost:5000${listing.images[0]}`} // prepend your server URL
            alt={listing.title}
            style={{
              width: "100%",
              height: 300,
              objectFit: "cover",
              borderRadius: 12,
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: 300,
              backgroundColor: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              color: "#888",
            }}
          >
            No Image Available
          </div>
        )}

        <button
          type="button"
          className="airbnb-btn airbnb-btn-ghost"
          style={{ position: "absolute", bottom: 16, right: 16 }}
          onClick={showAllPhotos}
        >
          📷 Show all photos
        </button>

        {/* Thumbnails */}
        {listing.images && listing.images.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: 4,
              position: "absolute",
              bottom: 16,
              left: 16,
            }}
          >
            {listing.images.slice(1, 5).map((img, i) => (
              <img
                key={i}
                src={`http://localhost:5000${img}`}
                alt={`Thumbnail ${i + 1}`}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
                onClick={showAllPhotos}
              />
            ))}
          </div>
        )}
      </div>

      <div className="listing-detail-layout">
        <div className="listing-detail-main">
          <h1>{listing.title}</h1>
          <p className="listing-detail-subtitle">
            <span style={{ color: "#ffb400" }}>★</span> 5.0 · {reviews.length} reviews · {listing.location}
          </p>
          <p className="listing-detail-description">{listing.description}</p>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>What this place offers</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {DEFAULT_AMENITIES.slice(0, 6).map((a) => (
                <span key={a} style={{ fontSize: 14 }}>✓ {a}</span>
              ))}
            </div>
            <button
              type="button"
              className="airbnb-btn airbnb-btn-ghost"
              style={{ marginTop: 12 }}
              onClick={showAllAmenities}
            >
              Show all amenities
            </button>
          </div>

          <section className="reviews-section">
            <h3>Reviews</h3>
            {user && !isHost && (
              <form onSubmit={submitReview} className="review-form">
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <label>
                    Rating
                    <select
                      value={reviewForm.rating}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, rating: Number(e.target.value) })
                      }
                      className="airbnb-input"
                      style={{ marginLeft: 8 }}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n} stars</option>
                      ))}
                    </select>
                  </label>
                  <input
                    className="airbnb-input"
                    placeholder="Add a comment (optional)"
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    style={{ flex: 1, minWidth: 200 }}
                  />
                  <button type="submit" className="airbnb-btn airbnb-btn-primary">
                    Submit review
                  </button>
                </div>
              </form>
            )}
            {reviews.length === 0 ? (
              <p style={{ color: "var(--color-gray-800)" }}>No reviews yet.</p>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="review-item">
                  <div className="review-header">
                    <strong>{r.user?.username || "User"}</strong>
                    <span className="review-stars">{"★".repeat(r.rating)}</span>
                  </div>
                  {r.comment && <p style={{ margin: 0, fontSize: 14 }}>{r.comment}</p>}
                </div>
              ))
            )}
          </section>
        </div>

        {!isHost && (
          <div className="booking-card">
            <p className="booking-card-price">
              ${listing.pricePerNight} <span>night</span>
            </p>
            <p className="booking-you-wont">You won&apos;t be charged yet</p>
            <form onSubmit={book}>
              <div className="booking-card-dates">
                <label>
                  CHECK-IN
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                  />
                </label>
                <label>
                  CHECKOUT
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                  />
                </label>
              </div>
              <label style={{ display: "block", marginTop: 12, fontSize: 12, fontWeight: 600 }}>
                GUESTS
                <input
                  type="number"
                  min="1"
                  max={listing.guests}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  style={{ width: "100%", padding: 12, marginTop: 4, border: "1px solid var(--color-gray-400)", borderRadius: 8 }}
                />
              </label>
              <button type="submit" className="airbnb-btn airbnb-btn-primary" style={{ width: "100%", marginTop: 16 }}>
                Reserve
              </button>
            </form>
            {nights > 0 && (
              <div className="booking-price-breakdown">
                <div className="booking-price-row">
                  <span>${listing.pricePerNight} x {nights} nights</span>
                  <span>${subtotal}</span>
                </div>
                <div className="booking-price-row">
                  <span>Cleaning fee</span>
                  <span>${cleaningFee}</span>
                </div>
                <div className="booking-price-row">
                  <span>Service fee</span>
                  <span>${serviceFee}</span>
                </div>
                <div className="booking-price-row total">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

