import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const aboutRef = useRef(null);
  const searchRef = useRef(null);
  const contactRef = useRef(null);
  const footerRef = useRef(null);

  const [prompt, setPrompt] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeRecipe, setActiveRecipe] = useState(null); // modal content

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  const searchRecipes = async () => {
    if (!prompt.trim()) return;
    setRecipes([]);
    setError("");
    setLoading(true);
    setActiveRecipe(null);

    try {
      // const res = await fetch("http://localhost:8000/search", {
        const res = await fetch("/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, limit: 10 }),
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecipes(data);
        setTimeout(() => scrollTo(searchRef), 120);
      } else {
        setError(data.error || "Unexpected response");
      }
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    // Enter submits (Shift+Enter = newline). Cmd/Ctrl+Enter also submits.
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault();
      searchRecipes();
    }
  };

  const openModal = (recipe) => setActiveRecipe(recipe);
  const closeModal = () => setActiveRecipe(null);

  useEffect(() => {
    // ESC to close + lock scroll when modal is open
    const onEsc = (e) => e.key === "Escape" && closeModal();
    if (activeRecipe) {
      document.addEventListener("keydown", onEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [activeRecipe]);

  const formatKey = (str) =>
    str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const formatTimeDisplay = (time) => {
    if (time === undefined || time === null) return null;
    if (typeof time === "string") return time;
    const mins = Number(time);
    if (Number.isNaN(mins)) return String(time);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h} ${h === 1 ? "hour" : "hours"} ${m} ${m === 1 ? "minute" : "minutes"}`;
    if (h) return `${h} ${h === 1 ? "hour" : "hours"}`;
    return `${m} ${m === 1 ? "minute" : "minutes"}`;
  };

  // Render array as list, or fallback to paragraph for plain strings
  const renderMaybeArrayAsList = (data, ordered = false) => {
    if (!data) return null;
    if (Array.isArray(data)) {
      const ListTag = ordered ? "ol" : "ul";
      return (
        <ListTag className={`modal-list ${ordered ? "numbered" : ""}`}>
          {data.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ListTag>
      );
    }
    return <p className="modal-raw">{String(data)}</p>;
  };

  return (
    <div className="app">
      {/* ---------- HEADER ---------- */}
      <nav className="navbar improved-header">
        <div className="nav-left">
          <img src="/icon.png" alt="logo" className="header-logo" />
          <span className="brand-name">
            Crave<span>Caster</span>
          </span>
        </div>

        <ul className="nav-links improved-links">
          <li onClick={() => scrollTo(aboutRef)}>Home</li>
          <li onClick={() => scrollTo(searchRef)}>Search</li>
          <li onClick={() => scrollTo(contactRef)}>Contact Us</li>
        </ul>
      </nav>

      {/* ---------- ABOUT / HERO ---------- */}
      <section
        ref={aboutRef}
        className="page about"
        style={{ backgroundImage: `url(/background.jpg)` }}
      >
        <div className="about-content">
          <h1>Find The Perfect Recipe With CraveCaster</h1>
          <p>
            Describe what you want to cook — like “Low‑fat, high‑protein
            breakfast under 30 minutes with eggs” — and get curated recipe
            ideas in seconds.
          </p>
          <button className="cta-btn" onClick={() => scrollTo(searchRef)}>
            Start Searching
          </button>
        </div>
      </section>

      {/* ---------- SEARCH ---------- */}
      <section ref={searchRef} className="page game">
        <div className="game-container">
          <h2 className="game-title">Describe Your Meal</h2>

          <div className="game-card">
            <div className="search-control">
              <textarea
                className="input-area"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Write your Prompt Here"
                onKeyDown={onKeyDown}
              />
              <div className="game-actions">
                <button
                  className="yes-modern"
                  onClick={searchRecipes}
                  disabled={!prompt.trim() || loading}
                >
                  {loading ? "Searching..." : "Find Recipes"}
                </button>
                <button
                  className="no-modern"
                  onClick={() => {
                    setPrompt("");
                    setRecipes([]);
                    setError("");
                    setActiveRecipe(null);
                  }}
                  disabled={loading}
                >
                  Clear
                </button>
              </div>
              {error && <p className="error-text">⚠️ {error}</p>}
            </div>

            {/* Results: Title + Photo only; click opens modal */}
            <div className="results-grid">
              {recipes.map((r, i) => (
                <div
                  key={i}
                  className="recipe-card"
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${r.name || "recipe"} details`}
                  onClick={() => openModal(r)}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && openModal(r)
                  }
                >
                  <div className="card-media">
                    {r.image && (
                      <img
                        src={r.image}
                        alt={r.name || "Recipe image"}
                        className="card-image"
                        loading="lazy"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                    <div className="card-overlay">
                      <h3 className="card-title">{r.name || "Untitled Recipe"}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CONTACT ---------- */}
      <section ref={contactRef} className="page contact">
        <div className="contact-container">
          <div className="contact-left">
            <div className="contact-icon-wrapper">
              <img src="/icon.png" alt="icon" className="contact-icon" />
            </div>
            <h2>Contact CraveCaster</h2>
            <p>Questions or feedback? We’d love to hear from you!</p>
            <p>
              📧 <a href="mailto:support@CraveCaster.app">support@CraveCaster.app</a>
            </p>
            <small>We usually respond within 24 hours.</small>
          </div>

          <form
            className="contact-right"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thanks! We’ll get back to you soon.");
            }}
          >
            <div className="form-row">
              <input type="text" placeholder="Name" required />
              <input type="email" placeholder="Email" required />
            </div>
            <input type="text" placeholder="Subject" />
            <textarea placeholder="Your message..."></textarea>
            <button className="send-btn" type="submit">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer ref={footerRef} className="footer">
        <div className="footer-inner">
          <p className="footer-text">
            🥗 Powered using ML — made with love by the CraveCaster Team.
          </p>
        </div>
        <p className="footer-sub">
          © {new Date().getFullYear()} CraveCaster. All rights reserved.
        </p>
      </footer>

      {/* ---------- DETAILS MODAL (no image in description) ---------- */}
      {activeRecipe && (
        <div className="modal-backdrop" onClick={closeModal} aria-hidden="true">
          <div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal} aria-label="Close">
              ✕
            </button>

            <div className="modal-body">
              <div className="modal-topbar">
                <h2 id="modal-title" className="modal-title">
                  {activeRecipe.name}
                </h2>
                {activeRecipe.time !== undefined && activeRecipe.time !== null && (
                  <span className="pill">
                    {formatTimeDisplay(activeRecipe.time)}
                  </span>
                )}
              </div>

              {activeRecipe.description ||
              activeRecipe.desc ||
              activeRecipe.summary ? (
                <p className="modal-desc">
                  {activeRecipe.description ||
                    activeRecipe.desc ||
                    activeRecipe.summary}
                </p>
              ) : null}

              {(activeRecipe.ingredients &&
                activeRecipe.ingredients.length !== 0) ||
              (typeof activeRecipe.ingredients === "string" &&
                activeRecipe.ingredients.trim()) ? (
                <>
                  <p className="modal-subheading">Ingredients</p>
                  {renderMaybeArrayAsList(activeRecipe.ingredients, false)}
                </>
              ) : null}

              {(activeRecipe.directions &&
                activeRecipe.directions.length !== 0) ||
              (typeof activeRecipe.directions === "string" &&
                activeRecipe.directions.trim()) ? (
                <>
                  <p className="modal-subheading">Instructions</p>
                  {renderMaybeArrayAsList(activeRecipe.directions, true)}
                </>
              ) : null}

              {activeRecipe.nutrition &&
                Object.values(activeRecipe.nutrition).some(Boolean) && (
                  <>
                    <p className="modal-subheading">Nutrition</p>
                    <table className="modal-nutrition-table">
                      <tbody>
                        {Object.entries(activeRecipe.nutrition).map(([k, v]) =>
                          v ? (
                            <tr key={k}>
                              <td className="nut-key">{formatKey(k)}</td>
                              <td>{v}</td>
                            </tr>
                          ) : null
                        )}
                      </tbody>
                    </table>
                  </>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;