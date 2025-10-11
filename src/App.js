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
      const res = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, limit: 10 }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) setRecipes(data);
      else setError(data.error || "Something went wrong");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🥗 Better Recipes Finder</h1>
      <div style={styles.inputArea}>
        <textarea
          style={styles.textarea}
          rows={3}
          placeholder="Type what you're craving... 
For example: 'Show me high-protein vegetarian dinner under 30 minutes with lentils'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button onClick={searchRecipes} style={styles.button} disabled={!prompt || loading}>
          {loading ? "Searching..." : "Find Recipes"}
        </button>
      </div>

      {error && <p style={styles.error}>⚠️ {error}</p>}

      <div style={styles.results}>
        {recipes.map((r, idx) => (
          <div key={idx} style={styles.card}>
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
            <p><strong>Calories:</strong> {r.nutrition?.calories} kcal</p>
            <p><strong>Protein:</strong> {r.nutrition?.protein} g</p>
            <p style={styles.subheading}>Ingredients:</p>
            <ul>
              {r.ingredients && r.ingredients.slice(0, 6).map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
            <p style={styles.subheading}>Directions (first steps):</p>
            <ol>
              {r.directions && r.directions.slice(0, 3).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    background: "#fdfdfd",
  },
  title: {
    textAlign: "center",
    marginBottom: "10px",
  },
  inputArea: {
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
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4caf50",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
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
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: "15px",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    borderRadius: "8px",
  },
  subheading: { fontWeight: "bold", marginTop: "10px" },
  error: { color: "red", textAlign: "center" },
};

export default App;