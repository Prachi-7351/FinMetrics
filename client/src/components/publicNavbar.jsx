import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./PublicNavbar.css";

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [featOpen, setFeatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dropRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setFeatOpen(false);
      }
    };

    const closeOnEsc = (e) => {
      if (e.key === "Escape") setFeatOpen(false);
    };

    document.addEventListener("mousedown", closeDropdown);
    document.addEventListener("keydown", closeOnEsc);

    return () => {
      document.removeEventListener("mousedown", closeDropdown);
      document.removeEventListener("keydown", closeOnEsc);
    };
  }, []);

  const goToSection = (id) => {
    setFeatOpen(false);
    setMobileOpen(false);

    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }

    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      title: "AI CFO Engine",
      desc: "AI-powered recommendations based on burn rate, runway, and risk exposure.",
    },
    {
      title: "Stress Testing",
      desc: "Simulate revenue decline, cost increases, and funding delays.",
    },
    {
      title: "Risk Radar",
      desc: "Continuous financial health monitoring with dynamic risk scoring.",
    },
  ];

  return (
    <nav className="public-navbar">
      <div
        className="nav-bg"
        style={{
          background: scrolled
            ? "rgba(5,9,15,0.94)"
            : "rgba(5,9,15,0.72)",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.07)"
            : "1px solid rgba(255,255,255,0.04)",
          boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.5)" : "none",
        }}
      />

      <div
        className="nav-inner"
        style={{
          padding: scrolled ? "10px 32px" : "15px 32px",
        }}
      >
        <Link to="/" className="nav-logo">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path
                d="M3 17l4-8 4 4 4-6 4 10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span>FinMetrics</span>
        </Link>

        <div className="desktop-nav">
          <div ref={dropRef} className="dropdown-wrap">
            <button
              className="nav-link"
              onClick={() => setFeatOpen((prev) => !prev)}
            >
              Features
              <span className={featOpen ? "chevron open" : "chevron"}>⌄</span>
            </button>

            {featOpen && (
              <div className="features-dropdown">
                {features.map((item) => (
                  <button
                    key={item.title}
                    className="dropdown-card"
                    onClick={() => goToSection("features")}
                  >
                    <p>{item.title}</p>
                    <span>{item.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="nav-link" onClick={() => goToSection("how-it-works")}>
            How It Works
          </button>

          <button className="nav-link" onClick={() => goToSection("contact")}>
            Contact
          </button>

          <Link to="/login" className="btn-login">
            Login
          </Link>

          <Link to="/signup" className="btn-primary">
            Sign Up
          </Link>
        </div>

        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          <button onClick={() => goToSection("features")}>Features</button>
          <button onClick={() => goToSection("how-it-works")}>How It Works</button>
          <button onClick={() => goToSection("contact")}>Contact</button>
          <Link to="/login" onClick={() => setMobileOpen(false)}>
            Login
          </Link>
          <Link to="/signup" onClick={() => setMobileOpen(false)}>
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}