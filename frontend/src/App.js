import React, { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchRecipes = async () => {
    setRecipes([]);
    setError("");
    setLoading(true);
    try {
      // const res = await fetch("http://localhost:8000/search", {
      const res = await fetch("/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, limit: 10 }),
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setRecipes(data);
      else setError(data.error || "Unexpected response");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🥗 Better Recipes Finder</h1>

      <div style={styles.control}>
        <textarea
          style={styles.textarea}
          rows={3}
          placeholder="Describe your meal — e.g. 'Low-fat high-protein breakfast under 30 minutes with eggs'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button onClick={searchRecipes} style={styles.button} disabled={!prompt || loading}>
          {loading ? "Searching..." : "Find Recipes"}
        </button>
      </div>

      {error && <p style={styles.error}>⚠️ {error}</p>}

      <div style={styles.results}>
        {recipes.map((r, i) => (
          <div key={i} style={styles.card}>
            {r.image && (
              <img
                src={r.image}
                alt={r.name}
                style={styles.image}
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
            <h3>{r.name}</h3>
            <p><strong>Time:</strong> {r.time} mins</p>

            <div style={styles.nutrition}>
              <h4>Nutrition</h4>
              <table style={styles.nutritionTable}>
                <tbody>
                  {Object.entries(r.nutrition || {}).map(([k, v]) => (
                    v ? (
                      <tr key={k}>
                        <td style={styles.nutKey}>{formatKey(k)}</td>
                        <td>{v}</td>
                      </tr>
                    ) : null
                  ))}
                </tbody>
              </table>
            </div>

            <p style={styles.subheading}>Ingredients:</p>
            <ul>
              {r.ingredients?.slice(0, 6).map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>

            <p style={styles.subheading}>Directions:</p>
            <ol>
              {r.directions?.slice(0, 3).map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Helper for display formatting ---
function formatKey(str) {
  return str
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// --- Styles ---
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    background: "#f8f9fa",
  },
  title: {
    textAlign: "center",
  },
  control: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  textarea: {
    width: "90%",
    maxWidth: "600px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    background: "#4caf50",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  results: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
  },
  card: {
    width: "300px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: "15px",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    borderRadius: "8px",
    marginBottom: "8px",
  },
  subheading: {
    fontWeight: "bold",
    marginTop: "10px",
  },
  nutrition: {
    marginTop: "10px",
    marginBottom: "10px",
  },
  nutritionTable: {
    width: "100%",
    fontSize: "14px",
    borderCollapse: "collapse",
  },
  nutKey: {
    textTransform: "capitalize",
    color: "#555",
  },
  error: { color: "red", textAlign: "center" },
};

export default App;