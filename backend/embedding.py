import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import pickle

df = pd.read_csv("recipe.csv")

def create_recipe_sentence(row):
    return (
        f"Recipe: {row['recipe_name']}. "
        f"Time to cook: {row['total_time']}. "
        f"Ingredients needed: {row['ingredients']}. "
        f"Cuisine category: {row['cuisine_path']}. "
        f"Nutritional facts: {row['nutrition']}."
    )

print("Building search context sentences")
df['search_context'] = df.apply(create_recipe_sentence, axis=1)

print("Loading all-mpnet-base-v2 model")
model = SentenceTransformer('all-mpnet-base-v2')

print("Encoding dataset")
embeddings = model.encode(df['search_context'].tolist(), show_progress_bar=True)

print("Saving embedding")
payload = {
    'dataframe': df,
    'embeddings': embeddings
}

with open('recipe_embeddings.pkl', 'wb') as f:
    pickle.dump(payload, f)

print("Saved")