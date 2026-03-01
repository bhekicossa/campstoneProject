import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-columns">
        <div className="footer-col">
          <h4>Support</h4>
          <a href="#help">Help Center</a>
          <a href="#safety">Safety information</a>
          <a href="#cancellation">Cancellation options</a>
          <a href="#covid">Our COVID-19 Response</a>
          <a href="#disabilities">Supporting people with disabilities</a>
          <a href="#report">Report a neighborhood concern</a>
        </div>
        <div className="footer-col">
          <h4>Community</h4>
          <a href="#org">Airbnb.org: disaster relief housing</a>
          <a href="#refugees">Support: Afghan refugees</a>
          <a href="#diversity">Celebrating diversity & belonging</a>
          <a href="#discrimination">Combating discrimination</a>
        </div>
        <div className="footer-col">
          <h4>Hosting</h4>
          <Link to="/dashboard">Try hosting</Link>
          <a href="#aircover">AirCover: protection for Hosts</a>
          <a href="#resources">Explore hosting resources</a>
          <a href="#forum">Visit our community forum</a>
          <a href="#responsible">How to host responsibly</a>
        </div>
        <div className="footer-col">
          <h4>About</h4>
          <a href="#newsroom">Newsroom</a>
          <a href="#features">Learn about new features</a>
          <a href="#founders">Letter from our founders</a>
          <a href="#careers">Careers</a>
          <a href="#investors">Investors</a>
          <a href="#luxe">Airbnb Luxe</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2022 Airbnb, Inc. · Privacy · Terms · Sitemap</span>
        <div className="footer-bottom-right">
          <span>English (US)</span>
          <span>$ USD</span>
          <div className="footer-social">
            <a href="#fb" aria-label="Facebook">f</a>
            <a href="#tw" aria-label="Twitter">𝕏</a>
            <a href="#ig" aria-label="Instagram">📷</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
