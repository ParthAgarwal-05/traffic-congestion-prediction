from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import json
import numpy as np

app = FastAPI(title="Pro Traffic Congestion Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model and label encoder
model = joblib.load('models/best_model.joblib')
le_target = joblib.load('models/target_encoder.joblib')
feature_encoders = joblib.load('models/feature_encoders.joblib')

class PredictRequest(BaseModel):
    day: int
    hour: int
    vehicleCount: int
    speed: float
    weather: str
    roadType: str

@app.post("/predict")
def predict(req: PredictRequest):
    # Prepare features
    # Encoding categorical inputs using saved encoders
    try:
        weather_enc = feature_encoders['Weather Conditions'].transform([req.weather])[0]
    except:
        weather_enc = 0
    try:
        road_enc = feature_encoders['RoadType'].transform([req.roadType])[0]
    except:
        road_enc = 0
        
    is_peak = 1 if (8 <= req.hour <= 10 or 17 <= req.hour <= 20) else 0
    density = req.vehicleCount / (req.speed + 1)
    
    # Feature columns MUST MATCH training order
    features = pd.DataFrame([{
        'DayOfWeek': req.day,
        'Hour': req.hour,
        'Traffic Volume': req.vehicleCount,
        'Average Speed': req.speed,
        'IsPeakHour': is_peak,
        'TrafficDensity': density,
        'Weather Conditions': weather_enc,
        'RoadType': road_enc
    }])
    
    pred_idx = model.predict(features)[0]
    pred_label = le_target.inverse_transform([pred_idx])[0]
    
    return {
        "congestionLevel": pred_label,
        "isPeakHour": bool(is_peak),
        "densityIndex": float(density)
    }

@app.get("/metrics")
def get_metrics():
    try:
        with open('models/metrics.json', 'r') as f:
            return json.load(f)
    except:
        return {"error": "Metrics not found."}

@app.get("/recommendation")
def get_recommendation(day: int):
    # Simple recommendation based on peak hour logic
    # In a real app, this would query historical trend database
    best_time = "11:00 AM - 3:00 PM"
    avoid_time = "8:00 AM - 10:00 AM and 5:00 PM - 8:00 PM"
    
    return {
        "bestTime": best_time,
        "avoidTime": avoid_time,
        "tip": "Traffic is lighter during mid-day. Try to schedule your trip between 11:00 AM and 3:00 PM."
    }

@app.get("/data")
def get_data():
    try:
        # Load a sample for charts - simulated "pro" data enrichment
        df = pd.read_csv('../data/traffic.csv').dropna().sample(300, random_state=42)
        # Add hours to make charts interesting
        np.random.seed(42)
        df['Hour'] = np.random.randint(0, 24, size=len(df))
        
        # Mapping to display labels
        def categorize_congestion(val):
            try:
                val = float(val)
                if val < 40: return 'Low'
                elif val < 75: return 'Medium'
                else: return 'High'
            except: return 'Medium'
        df['Status'] = df['Congestion Level'].apply(categorize_congestion)
        
        return {"data": df.to_dict(orient="records")}
    except:
        return {"error": "Data loading failed."}
