from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import json

app = FastAPI(title="Traffic Congestion Prediction API")

# Allow CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model and label encoder
model = joblib.load('models/rf_model.joblib')
le = joblib.load('models/label_encoder.joblib')

class PredictRequest(BaseModel):
    time: str
    day: int
    vehicleCount: int
    speed: float

@app.post("/predict")
def predict(req: PredictRequest):
    # Map input to model features
    features = pd.DataFrame({
        'DayOfWeek': [req.day],
        'Traffic Volume': [req.vehicleCount],
        'Average Speed': [req.speed]
    })
    
    pred_idx = model.predict(features)[0]
    pred_label = le.inverse_transform([pred_idx])[0]
    
    return {"congestionLevel": pred_label}

@app.get("/metrics")
def get_metrics():
    try:
        with open('models/metrics.json', 'r') as f:
            metrics = json.load(f)
        return metrics
    except FileNotFoundError:
        return {"error": "Metrics not found. Train the model first."}

@app.get("/data")
def get_data():
    # Return a sample of the dataset for frontend visualization
    try:
        df = pd.read_csv('../data/traffic.csv').dropna()
        df['Date'] = pd.to_datetime(df['Date'], format='%d-%m-%Y', errors='coerce')
        df = df.dropna(subset=['Date'])
        df['DayOfWeek'] = df['Date'].dt.dayofweek
        
        # Categorize congestion level for the charts to match our prediction format
        def categorize_congestion(val):
            try:
                val = float(val)
                if val < 40: return 'Low'
                elif val < 75: return 'Medium'
                else: return 'High'
            except:
                return 'Medium'
        df['Congestion Category'] = df['Congestion Level'].apply(categorize_congestion)
        
        # Sample 200 points to keep the payload lightweight for the UI
        sample = df[['DayOfWeek', 'Traffic Volume', 'Average Speed', 'Congestion Category']].sample(200, random_state=42)
        return {"data": sample.to_dict(orient="records")}
    except Exception as e:
        return {"error": str(e)}
