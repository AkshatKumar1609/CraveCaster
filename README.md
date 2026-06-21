# 🍽️ CraveCaster

> **Describe a craving. Get the perfect recipe.**

CraveCaster is a full-stack AI-powered recipe search engine that understands *what you feel like eating*, not just what you type. Instead of keyword matching, it uses semantic vector embeddings to map your natural-language craving — *"something warm and spicy for a rainy night"* — to the most relevant recipes in its database. The result is a beautifully polished, Spotify-style UI paired with a blazing-fast Python backend.

---

## ✨ Key Features

- **Semantic Search** — Natural-language queries are embedded via `sentence-transformers/all-mpnet-base-v2` and matched against pre-computed recipe embeddings using cosine similarity, enabling intent-aware search far beyond keyword filters.
- **Dietary Awareness** — The backend automatically detects vegan/vegetarian intent in queries and filters the search corpus before computing similarity, ensuring relevant results without explicit toggles.
- **Match Score** — Every result is ranked and annotated with a `match_score_percentage` (0–100%), giving users instant confidence in each recommendation.
- **Interactive Recipe Detail View** — A cinematic hero-image layout with a blurred background effect, ingredient checklists, step-by-step cooking directions, and a structured nutrition panel.
- **Save & Profile System** — Authenticated users can bookmark recipes to a personal collection, powered by Supabase Auth and a real-time database.
- **Dark / Light Mode** — System-aware theming with `next-themes`, no user configuration needed.
- **One-Binary Deployment** — The FastAPI backend serves the compiled React frontend as static files, so the entire application ships as a single Render web service.

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| API Framework | FastAPI 0.110 + Uvicorn |
| ML / Embeddings | `sentence-transformers` (all-mpnet-base-v2) via Hugging Face Inference API |
| Similarity Search | `scikit-learn` cosine similarity + NumPy argsort |
| Data Layer | Pandas DataFrame + pickled embedding matrix |
| Config | `python-dotenv` |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 (SWC) |
| Styling | Tailwind CSS v3 + `tailwindcss-animate` |
| Component Library | shadcn/ui (Radix UI primitives) |
| Animation | Framer Motion |
| State / Data Fetching | TanStack React Query v5 |
| Auth & Database | Supabase (Auth + Postgres) |
| Routing | React Router v6 |
| Icons | Lucide React |

### Infrastructure
| Layer | Technology |
|---|---|
| Hosting | Render (free tier web service) |
| Database | Supabase (hosted Postgres) |

---

## 🗂️ Architecture & Project Structure

```
CraveCaster/
├── backend/
│   ├── embedding.py          # One-time script: builds & pickles recipe embeddings
│   ├── main.py               # FastAPI app — /health, /search endpoints + static file serving
│   ├── recipe.csv            # Cleaned recipe dataset (source of truth)
│   ├── recipe_embeddings.pkl # Pre-computed embedding matrix (binary, ~5 MB)
│   ├── requirements.txt
│   └── .env                  # HF_TOKEN (Hugging Face API key)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Index.tsx         # Landing + search entry point
│   │   │   ├── SavedRecipes.tsx  # User's bookmarked recipes
│   │   │   ├── Profile.tsx       # Account management
│   │   │   └── Auth.tsx          # Login / sign-up
│   │   ├── components/
│   │   │   ├── SearchBar.tsx       # Animated search input
│   │   │   ├── RecipeCard.tsx      # Grid card with match score badge
│   │   │   ├── RecipeDetailView.tsx# Full recipe page (hero, ingredients, steps, nutrition)
│   │   │   ├── RecipeResultsView.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── AuthDialog.tsx      # Auth gate modal
│   │   ├── hooks/
│   │   │   ├── useRecipeSearch.ts  # API call, data mapping, parsing utilities
│   │   │   ├── useSavedRecipes.ts  # Supabase CRUD for saved recipes
│   │   │   └── useAuth.ts          # Supabase auth state
│   │   └── types/
│   │       └── recipe.ts           # Recipe, RecipeNutrition, SavedRecipe interfaces
│   ├── .env                        # VITE_SUPABASE_* keys
│   └── package.json
│
└── render.yaml                     # Unified build + start config for Render
```

**Data flow:**

```
User types craving
    │
    ▼
SearchBar (frontend)
    │  GET /search?query=...&limit=10
    ▼
FastAPI /search (backend)
    │  1. Dietary filter (vegan/vegetarian regex mask)
    │  2. Embed query via Hugging Face Inference API
    │  3. cosine_similarity(query_vector, filtered_embeddings)
    │  4. argsort → top-N results with match_score_percentage
    ▼
useRecipeSearch hook
    │  Parse nutrition string → structured RecipeNutrition
    │  Parse time string → timeMinutes (used for difficulty badge)
    │  Map raw API fields → typed Recipe objects
    ▼
RecipeCard / RecipeDetailView (React)
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**
- A [Hugging Face](https://huggingface.co/settings/tokens) account (free) for the API token
- A [Supabase](https://supabase.com) project for auth and saved recipes

---

### 1. Clone the repository

```bash
git clone https://github.com/AkshatKumar1609/CraveCaster.git
cd CraveCaster
```

---

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r backend/requirements.txt
```

Create `backend/.env`:

```env
HF_TOKEN=hf_your_huggingface_api_token_here
```

**Generate the embedding index** (run once; produces `recipe_embeddings.pkl`):

```bash
cd backend
python embedding.py
cd ..
```

> ⚠️ This step encodes the entire recipe dataset using `all-mpnet-base-v2` and may take several minutes depending on your hardware. The resulting `.pkl` file is required for the search API to start.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
```

---

### 4. Run Locally

Open two terminals:

**Terminal 1 — Backend:**
```bash
# From the project root
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

The frontend dev server runs at `http://localhost:5173` and proxies API calls to the backend at `http://localhost:8000`.

---

## 💡 Usage

1. **Search by craving** — Type anything into the search bar: `"quick vegan pasta"`, `"high-protein breakfast under 30 minutes"`, or just `"comfort food"`. The model understands the intent.
2. **Browse results** — Cards are sorted by match score. Click any card to open the full recipe detail.
3. **Cook interactively** — Check off ingredients as you gather them and tick each direction step as you go.
4. **Save recipes** — Log in to bookmark any recipe to your personal collection under **Saved Recipes**.

---

## 🔬 Technical Highlights

### Offline Embedding Index
Rather than embedding all recipes at query time, `embedding.py` builds a context sentence for each recipe by concatenating its name, cook time, ingredients, cuisine, and nutrition facts into a single string, then encodes the entire dataset once with `SentenceTransformer('all-mpnet-base-v2')`. The resulting NumPy matrix and Pandas DataFrame are pickled together and loaded into memory at server startup. Query latency is therefore dominated only by the single Hugging Face API call for the user's query, not the entire corpus.

### Dietary Pre-filtering
Before computing any similarity, the backend checks whether the query contains vegan/vegetarian intent keywords. If detected, it builds a boolean mask that filters out any recipe whose `ingredients` column contains meat keywords (`chicken|beef|pork|fish|...`). Cosine similarity is then computed only against this filtered sub-matrix — a pragmatic two-stage retrieval approach that improves precision for dietary-restricted queries with zero ML overhead.

### Client-side Data Normalization
The `useRecipeSearch` hook contains a dedicated parsing layer that converts the raw API strings into structured TypeScript objects before touching any component state. Nutrition strings like `"Total Fat 11g 14%, ..."` are destructured into a typed `RecipeNutrition` interface via named regex patterns. Cook times like `"1 hrs 20 mins"` are parsed to integer minutes, which power the `getDifficulty()` helper (≤30 min → Easy, ≤60 min → Medium, >60 min → Hard).

### Unified Deployment
`render.yaml` defines a single web service that installs both Python and Node dependencies, builds the React bundle into `frontend/dist/`, and then starts Uvicorn. FastAPI's `StaticFiles` mount serves the compiled frontend from the same process — no separate frontend hosting, no CORS configuration in production.

---

## 📄 License

This project is open-source. Feel free to fork and extend it.
