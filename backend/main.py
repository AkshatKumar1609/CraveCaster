from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import json
import re
import ast
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client()

app = FastAPI(title="Better Recipes Finder")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def safe_parse_list(val):
    if isinstance(val, list):
        return val
    if pd.isna(val):
        return []
    try:
        parsed = ast.literal_eval(val)
        if isinstance(parsed, list):
            return parsed
    except Exception:
        pass
    return [v.strip() for v in str(val).split(",") if v.strip()]

# df = pd.read_csv('recipes_clean.csv')
df = pd.read_csv('backend/recipes_clean.csv')

df["ingredients_list"] = df["ingredients_list"].apply(safe_parse_list)
df["directions_list"] = df["directions_list"].apply(safe_parse_list)

numeric_cols = [
    "total_time", "fat", "sat_fat", "cholesterol", "sodium",
    "fiber", "sugar", "protein", "calcium", "iron", "potassium"
]
for col in numeric_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
    else:
        df[col] = 0

# TF-IDF
vectorizer = TfidfVectorizer(stop_words="english")
X = vectorizer.fit_transform(df["text"].fillna("").values)

# Gemini Ai
def extract_constraints_google(prompt: str):
    instruction = (
        "Extract structured numeric recipe constraints from the user's request. "
        "Return JSON ONLY with these possible keys: "
        "max_time, min_protein, max_fat, max_sat_fat, max_cholesterol, max_sodium, "
        "min_fiber, max_sugar, min_calcium, min_iron, min_potassium, "
        "available_ingredients (list of strings). "
        "Leave fields null if not specified. Do NOT include explanations."
    )
    full_prompt = f"{instruction}\nUser Prompt: {prompt}"

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt
        )
        text = response.text.strip()
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
    except Exception as e:
        print("Constraint extraction error:", e)

    return {
        "max_time": None, "min_protein": None, "max_fat": None,
        "max_sat_fat": None, "max_cholesterol": None, "max_sodium": None,
        "min_fiber": None, "max_sugar": None, "min_calcium": None,
        "min_iron": None, "min_potassium": None, "available_ingredients": []
    }

class Query(BaseModel):
    prompt: str
    limit: Optional[int] = 10

#api
@app.post("/search")
def search(q: Query):
    try:
        c = extract_constraints_google(q.prompt)
        results = df.copy()

        ranges = {
            "max_time": lambda v: results["total_time"] <= v,
            "min_protein": lambda v: results["protein"] >= v,
            "max_fat": lambda v: results["fat"] <= v,
            "max_sat_fat": lambda v: results["sat_fat"] <= v,
            "max_cholesterol": lambda v: results["cholesterol"] <= v,
            "max_sodium": lambda v: results["sodium"] <= v,
            "min_fiber": lambda v: results["fiber"] >= v,
            "max_sugar": lambda v: results["sugar"] <= v,
            "min_calcium": lambda v: results["calcium"] >= v,
            "min_iron": lambda v: results["iron"] >= v,
            "min_potassium": lambda v: results["potassium"] >= v,
        }

        for key, condition in ranges.items():
            val = c.get(key)
            if val is not None:
                try:
                    results = results[condition(float(val))]
                except Exception as ex:
                    print(f"Failed filter {key}: {ex}")

        # Ingredient filter
        ingredients = [i.lower() for i in c.get("available_ingredients", [])]
        if ingredients:
            avail_set = set(ingredients)
            def has_any(lst):
                joined = " ".join(lst).lower()
                return any(i in joined for i in avail_set)
            results = results[results["ingredients_list"].apply(has_any)]

        # Similarity ranking 
        vec = vectorizer.transform([q.prompt])
        sims = linear_kernel(vec, X).flatten()
        results["_score"] = results.index.map(lambda i: float(sims[i]))
        results = results.sort_values("_score", ascending=False)

        top = results.head(q.limit or 10)
        output = []
        for _, r in top.iterrows():
            output.append({
                "name": r.get("recipe_name"),
                "time": int(r.get("total_time", 0)),
                "ingredients": r.get("ingredients_list", []),
                "directions": r.get("directions_list", []),
                "image": r.get("img_src", ""),
                "nutrition": {
                    "fat": r.get("fat"),
                    "sat_fat": r.get("sat_fat"),
                    "cholesterol": r.get("cholesterol"),
                    "sodium": r.get("sodium"),
                    "fiber": r.get("fiber"),
                    "sugar": r.get("sugar"),
                    "protein": r.get("protein"),
                    "calcium": r.get("calcium"),
                    "iron": r.get("iron"),
                    "potassium": r.get("potassium"),
                },
                "score": float(r["_score"])
            })
        return output

    except Exception as e:
        print("Search error:", e)
        return {"error": str(e)}

frontend_dir = os.path.join(os.path.dirname(__file__), "../frontend/build")
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    if os.path.exists(frontend_dir):
        return FileResponse(os.path.join(frontend_dir, "index.html"))
    return {"detail": "Frontend not found"}