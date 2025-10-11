import pandas as pd
import ast
import os
import re

def safe_parse_list(val):
    """Safely parse strings into list of lowercase ingredients or directions."""
    if isinstance(val, list):
        return [str(x).strip().lower() for x in val]
    if pd.isna(val):
        return []
    s = str(val)
    # Handle simple comma-separated text
    if "[" not in s and "]" not in s:
        return [x.strip().lower() for x in s.split(",") if x.strip()]
    try:
        parsed = ast.literal_eval(s)
        if isinstance(parsed, list):
            return [str(x).strip().lower() for x in parsed]
    except Exception:
        pass
    return []

def parse_nutrition_field(text):
    """
    Parse Allrecipes-style nutrition strings.
    Extracts fat, cholesterol, sodium, carbs, sugars, protein, vitamins, minerals.
    """
    if pd.isna(text):
        return {}
    s = str(text).lower().replace(",", " ")

    # Helper to extract number following a keyword
    def val_for(keyword, unit_pattern=r"(?:g|mg|mcg)?"):
        pattern = rf"{keyword}\D*?(\d+(?:\.\d+)?)\s*{unit_pattern}"
        m = re.search(pattern, s)
        if not m:
            return None
        try:
            return float(m.group(1))
        except Exception:
            return None

    nutrients = {}
    keyword_map = {
        "fat": "total fat",
        "sat_fat": "saturated fat",
        "cholesterol": "cholesterol",
        "sodium": "sodium",
        "fiber": "fiber|dietary fiber",
        "sugar": "sugar|total sugars",
        "protein": "protein",
        "calcium": "calcium",
        "iron": "iron",
        "potassium": "potassium",
    }

    for key, pattern in keyword_map.items():
        val = val_for(pattern)
        if val is not None:
            nutrients[key] = val

    return nutrients

def parse_time_to_minutes(value):
    """Convert time strings like '1 hr 30 mins' to integer minutes."""
    if pd.isna(value):
        return 0
    s = str(value).lower()
    total = 0
    hr_match = re.search(r'(\d+)\s*h', s)
    if hr_match:
        total += int(hr_match.group(1)) * 60
    min_match = re.search(r'(\d+)\s*m', s)
    if min_match:
        total += int(min_match.group(1))
    if total == 0:
        try:
            total = int(float(s))
        except Exception:
            total = 0
    return total

def main():
    raw_csv = "recipes.csv"
    df = pd.read_csv(raw_csv)
    print(f"Loaded {len(df)} records from {raw_csv}")

    #Parse lists
    df["ingredients_list"] = df["ingredients"].apply(safe_parse_list)
    df["directions_list"] = df["directions"].apply(safe_parse_list)

    #Parse nutrition details
    nutr_df = df["nutrition"].apply(parse_nutrition_field).apply(pd.Series)
    df = pd.concat([df, nutr_df], axis=1)

    #Normalize total time (minutes)
    df["total_time"] = df["total_time"].apply(parse_time_to_minutes)

    #Create combined text for search
    df["text"] = (
        df["recipe_name"].fillna("") + " " +
        df["ingredients"].fillna("") + " " +
        df["directions"].fillna("") + " " +
        df["cuisine_path"].fillna("")
    )

    keep_cols = [
        "recipe_name", "total_time",
        "ingredients_list", "directions_list",
        "fat", "sat_fat", "cholesterol", "sodium", "carbohydrate", 
        "fiber", "sugar", "protein", "vitamin_c", "calcium", "iron", "potassium",
        "img_src", "text"
    ]
    df = df[[c for c in keep_cols if c in df.columns]]

    out_csv = "recipes_clean.csv"
    df.to_csv(out_csv, index=False)
    print(f"✅ Cleaned dataset saved → {os.path.abspath(out_csv)}")

if __name__ == "__main__":
    main()