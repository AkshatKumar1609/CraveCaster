from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd
import requests
import pickle
import os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(
    title="AI Recipe Search API",
    description="FastAPI backend utilizing semantic search vector models."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_df = None
db_embeddings = None

HF_TOKEN = os.getenv("HF_TOKEN")
API_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-mpnet-base-v2/pipeline/feature-extraction"

@app.on_event("startup")
def startup_event():
    global db_df, db_embeddings
    
    pickle_path = 'backend/recipe_embeddings.pkl'
    if not os.path.exists(pickle_path):
        raise FileNotFoundError(f"Critical Error: '{pickle_path}' was not found in working directory.")
        
    with open(pickle_path, 'rb') as f:
        payload = pickle.load(f)
    
    db_df = payload['dataframe']
    db_embeddings = payload['embeddings']

@app.get("/")
def health_check():
    return {"status": "online", "message": "Recipe Semantic Search Engine is running perfectly."}

def get_query_embedding_via_api(text_query: str):
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    response = requests.post(API_URL, headers=headers, json={"inputs": text_query})
    
    if response.status_code == 200:
        return np.array([response.json()])
    else:
        raise Exception(f"Hugging Face API Error: {response.text}")

@app.get("/search")
def search_recipes(query:str,limit:int=10):
    
    if not query.strip():
        return {"results": []}
    
    query_lower = query.lower()
    
    if "vegan" in query_lower or "vegetarian" in query_lower or "veg" in query_lower:
        meat_keywords = 'chicken|beef|pork|meat|fish|mutton|shrimp|prawn|bacon'
        diet_mask = ~db_df['ingredients'].str.lower().str.contains(meat_keywords, na=False)
        filtered_df = db_df[diet_mask].reset_index(drop=True)
        filtered_embeddings = db_embeddings[diet_mask]
    else:
        filtered_df = db_df.reset_index(drop=True)
        filtered_embeddings = db_embeddings
        
    try:
        query_vector = get_query_embedding_via_api(query)
    except Exception as e:
        return {"error": "Search service temporarily overloaded.", "details": str(e)}
    
    scores = cosine_similarity(query_vector, filtered_embeddings).flatten()
    
    top_indices = np.argsort(scores)[-limit:][::-1]
    
    response_results = []
    for rank, idx in enumerate(top_indices, start=1):
        row = db_df.iloc[idx]
        match_percentage = round(float(scores[idx]) * 100, 1)
        
        response_results.append({
            "rank": rank,
            "recipe_name": row['recipe_name'],
            "match_score_percentage": match_percentage,
            "total_time": row['total_time'],
            "rating": row['rating'],
            "cuisine_path": row['cuisine_path'],
            "nutrition": row['nutrition'],
            "ingredients": row['ingredients'],
            "directions": row['directions'],
            "img_url": row['img_src']
        })
        
    return {
        "user_query": query,
        "total_returned": len(response_results),
        "results": response_results
    }