import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("savedListings") || "[]");
    } catch {
      return [];
    }
  });

  const fetchListings = () => {
    setLoading(true);
    const params = {};
    if (location) params.location = location;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    api
      .get("/accommodations", { params })
      .then((res) => setListings(res.data || []))
      .catch((err) => {
        console.error(err);
        setError("Failed to load listings. Please check your API.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    localStorage.setItem("savedListings", JSON.stringify(savedIds));
  }, [savedIds]);

  const handleSearch = (e) => {
    e?.preventDefault?.();
    fetchListings();
  };

  const toggleSaved = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (error) {
    return (
      <div style={{ padding: 24, color: "var(--color-primary)", textAlign: "center" }}>
        {error}
      </div>
    );
  }

  return (
    <>
      <section className="home-hero-flex">
        <h2>Not sure where to go? Perfect.</h2>
        <button type="button" className="btn-flexible" onClick={() => fetchListings()}>
          I&apos;m flexible
        </button>
      </section>

      <section className="home-hero">
        <form className="home-search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            className="home-search-field"
            placeholder="Where are you going?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <span className="home-search-divider" />
          <input
            type="number"
            className="home-search-field"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={{ maxWidth: 100 }}
          />
          <span className="home-search-divider" />
          <input
            type="number"
            className="home-search-field"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{ maxWidth: 100 }}
          />
          <button type="submit" className="home-search-btn">
            Search
          </button>
        </form>
      </section>

      <div className="filter-chips">
        <button type="button" className="filter-chip">Free cancellation</button>
        <button type="button" className="filter-chip">Type of place</button>
        <button type="button" className="filter-chip">Price</button>
        <button type="button" className="filter-chip">Instant Book</button>
        <button type="button" className="filter-chip">More filters</button>
      </div>

      <section className="listings-grid">
        {loading ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 48, color: "var(--color-gray-800)" }}>
            Loading listings…
          </div>
        ) : listings.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 48, color: "var(--color-gray-800)" }}>
            No listings found.
          </div>
        ) : (
          listings.map((l, i) => (
            <Link to={`/listing/${l._id}`} key={l._id} className="listing-card">
              <div className="listing-card-wrapper">
                <div
                  className="listing-card-image"
                  style={{
                    background: `linear-gradient(135deg, 
                      hsl(${(i * 37) % 360}, 25%, 92%) 0%, 
                      hsl(${(i * 37 + 40) % 360}, 20%, 85%) 100%)`,
                  }}
                >
                  {l.location}
                </div>
                <button
                  type="button"
                  className={`listing-card-heart ${savedIds.includes(l._id) ? "saved" : ""}`}
                  onClick={(e) => toggleSaved(e, l._id)}
                  aria-label={savedIds.includes(l._id) ? "Unsave" : "Save"}
                >
                  ♥
                </button>
              </div>
              <div className="listing-card-body">
                <h3 className="listing-card-title">{l.title}</h3>
                <p className="listing-card-meta">Entire home in {l.location}</p>
                <p className="listing-card-price">
                  <span style={{ color: "#ffb400" }}>★</span> 5.0 · ${l.pricePerNight} night · up to {l.guests} guests
                </p>
              </div>
            </Link>
          ))
        )}
      </section>
    </>
  );
}
