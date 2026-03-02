import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const TAB = { RESERVATIONS: "reservations", LISTINGS: "listings", CREATE: "create" };

export default function Dashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TAB.RESERVATIONS);
  const [reservations, setReservations] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    location: "",
    pricePerNight: "",
    guests: "",
  });
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      const [resRes] = await Promise.all([
        api.get("/reservations/me").catch(() => ({ data: [] })),
      ]);
      setReservations(Array.isArray(resRes.data) ? resRes.data : []);
      if (user?.role === "host" || user?.role === "admin") {
        const accRes = await api.get("/accommodations");
        const all = accRes.data || [];
        setMyListings(all.filter((a) => a.host?._id === user.id || a.host === user.id));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, navigate, authLoading]);

  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (user?.role !== "host" && user?.role !== "admin") return;
    try {
      const formData = new FormData();
      formData.append("title", createForm.title);
      formData.append("description", createForm.description);
      formData.append("location", createForm.location);
      formData.append("pricePerNight", String(createForm.pricePerNight));
      formData.append("guests", String(createForm.guests));
      images.forEach((file) => {
        formData.append("images", file);
      });

      // Let axios set the correct multipart boundary automatically
      await api.post("/accommodations", formData);

      setCreateForm({
        title: "",
        description: "",
        location: "",
        pricePerNight: "",
        guests: "",
      });
      setImages([]);
      await fetchData();
      setActiveTab(TAB.LISTINGS);
      await Swal.fire({
        icon: "success",
        title: "Listing created",
        text: "Your listing has been created successfully.",
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create listing";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    }
  };

  const cancelReservation = async (resId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Cancel reservation?",
      text: "Are you sure you want to cancel this reservation?",
      showCancelButton: true,
      confirmButtonColor: "#ff385c",
      cancelButtonColor: "#717171",
      confirmButtonText: "Yes, cancel it",
    });
    if (!result.isConfirmed) return;
    try {
      await api.patch(`/reservations/${resId}/cancel`);
      setReservations((prev) => prev.filter((r) => r._id !== resId));
      await Swal.fire({
        icon: "success",
        title: "Cancelled",
        text: "Reservation has been cancelled.",
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to cancel",
      });
    }
  };

  const deleteListing = async (listingId, title) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete listing?",
      text: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      showCancelButton: true,
      confirmButtonColor: "#ff385c",
      cancelButtonColor: "#717171",
      confirmButtonText: "Yes, delete it",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/accommodations/${listingId}`);
      setMyListings((prev) => prev.filter((l) => l._id !== listingId));
      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Listing has been deleted.",
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to delete",
      });
    }
  };

  if (authLoading) return <div className="dashboard-content">Loading...</div>;
  if (!user) return null;
  if (loading && reservations.length === 0 && myListings.length === 0) {
    return <div className="dashboard-content">Loading...</div>;
  }

  const isHost = user.role === "host" || user.role === "admin";

  return (
    <>
      <div className="dashboard-top">{user.username}</div>
      <div className="dashboard-tabs">
        <button
          type="button"
          className={`dashboard-tab ${activeTab === TAB.RESERVATIONS ? "active" : ""}`}
          onClick={() => setActiveTab(TAB.RESERVATIONS)}
        >
          View Reservations
        </button>
        {isHost && (
          <>
            <button
              type="button"
              className={`dashboard-tab ${activeTab === TAB.LISTINGS ? "active" : ""}`}
              onClick={() => setActiveTab(TAB.LISTINGS)}
            >
              View Listings
            </button>
            <button
              type="button"
              className={`dashboard-tab ${activeTab === TAB.CREATE ? "active" : ""}`}
              onClick={() => setActiveTab(TAB.CREATE)}
            >
              Create Listing
            </button>
          </>
        )}
      </div>

      <div className="dashboard-content">
        {error && <p style={{ color: "var(--color-primary)", marginBottom: 16 }}>{error}</p>}

        {activeTab === TAB.RESERVATIONS && (
          <>
            <h2 className="dashboard-title">My Reservations</h2>
            {reservations.length === 0 ? (
              <p style={{ color: "var(--color-gray-800)" }}>No reservations yet.</p>
            ) : (
              <table className="reservations-table">
                <thead>
                  <tr>
                    <th>Booked by</th>
                    <th>Property</th>
                    <th>Check in</th>
                    <th>Check out</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r._id}>
                      <td>{r.guest?.username || "—"}</td>
                      <td>{r.accommodation?.title || "—"}</td>
                      <td>{r.checkIn ? new Date(r.checkIn).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}</td>
                      <td>{r.checkOut ? new Date(r.checkOut).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}</td>
                      <td>
                        {r.status === "booked" && (
                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() => cancelReservation(r._id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeTab === TAB.LISTINGS && isHost && (
          <>
            <h2 className="dashboard-title">My Hotel List</h2>
            {myListings.length === 0 ? (
              <p style={{ color: "var(--color-gray-800)" }}>No listings yet.</p>
            ) : (
              <div className="my-listings">
                {myListings.map((l) => (
                  <div key={l._id} className="my-listing-card">
                    <div className="my-listing-card-image">
                      {l.images && l.images.length > 0 ? (
                        <img
                          src={`http://localhost:5000${l.images[0]}`}
                          alt={l.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                        />
                      ) : (
                        <span>{l.location}</span>
                      )}
                    </div>
                    <div className="my-listing-card-body">
                      <h3 className="my-listing-card-title">{l.title}</h3>
                      <p className="my-listing-card-meta">Entire home in {l.location}</p>
                      <p className="my-listing-card-features">
                        {l.guests} guests · Entire Home · 1 Bed · 1 Bath · Wi-fi · Kitchen
                      </p>
                      <p className="my-listing-card-rating">
                        <span className="review-star">★</span> 5.0 (0 reviews)
                      </p>
                      <p className="my-listing-card-price">${l.pricePerNight} night</p>
                      <div className="my-listing-card-actions">
                        <NavLink to={`/listing/${l._id}`} className="btn-update">
                          Update
                        </NavLink>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => deleteListing(l._id, l.title)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === TAB.CREATE && isHost && (
          <div className="create-listing-form">
            <h2>Create Listing</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="create-listing-grid">
                <div>
                  <div className="create-listing-field">
                    <label>Listing Name</label>
                    <input
                      name="title"
                      value={createForm.title}
                      onChange={handleCreateChange}
                      placeholder="e.g. Sandton City Hotel"
                      required
                    />
                  </div>
                  <div className="create-listing-field">
                    <label>Location</label>
                    <input
                      name="location"
                      value={createForm.location}
                      onChange={handleCreateChange}
                      placeholder="City, Country"
                      required
                    />
                  </div>
                  <div className="create-listing-field">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={createForm.description}
                      onChange={handleCreateChange}
                      placeholder="Describe your place..."
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="create-listing-field">
                    <label>Rooms</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      readOnly
                      style={{ background: "var(--color-gray-100)", cursor: "not-allowed" }}
                    />
                  </div>
                  <div className="create-listing-field">
                    <label>Guests</label>
                    <input
                      name="guests"
                      type="number"
                      min="1"
                      value={createForm.guests}
                      onChange={handleCreateChange}
                      placeholder="Max guests"
                      required
                    />
                  </div>
                  <div className="create-listing-field">
                    <label>Price per night ($)</label>
                    <input
                      name="pricePerNight"
                      type="number"
                      min="1"
                      value={createForm.pricePerNight}
                      onChange={handleCreateChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="create-listing-images">
                <label>Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) =>
                    setImages(Array.from(e.target.files || []))
                  }
                />
                <button
                  type="button"
                  className="airbnb-btn airbnb-btn-blue"
                  style={{ marginBottom: 8 }}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  Upload Image
                </button>
                <div className="create-listing-upload-zone">
                  {images.length === 0
                    ? "No images selected yet."
                    : `${images.length} image(s) selected`}
                </div>
              </div>
              <div className="create-listing-form-actions">
                <button type="submit" className="btn-create">Create</button>
                <button type="button" className="btn-cancel" onClick={() => setActiveTab(TAB.LISTINGS)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
