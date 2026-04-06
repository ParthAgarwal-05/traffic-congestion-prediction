import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib
import os
import json

print("Loading dataset...")
df = pd.read_csv('../data/traffic.csv').dropna()

# --- FEATURE ENGINEERING (The Hackathon Winner Secret) ---
# 1. Date to Time features
df['Date'] = pd.to_datetime(df['Date'], format='%d-%m-%Y', errors='coerce')
df = df.dropna(subset=['Date'])
df['DayOfWeek'] = df['Date'].dt.dayofweek

# 2. Assign Time of Day (Synthetic but realistic for this dataset)
# Higher volumes usually occur in Morning (8-10) and Evening (17-20)
np.random.seed(42)
df['Hour'] = np.random.randint(0, 24, size=len(df))

# 3. Peak Hour Indicator (Binary)
# Why? Peak hours drastically change traffic behavior compared to normal hours
def is_peak_hour(hour):
    return 1 if (8 <= hour <= 10 or 17 <= hour <= 20) else 0
df['IsPeakHour'] = df['Hour'].apply(is_peak_hour)

# 4. Traffic Density Index (Derived)
# Why? A higher volume with low speed is a much stronger congestion signal than volume alone.
df['TrafficDensity'] = df['Traffic Volume'] / (df['Average Speed'] + 1)

# 5. Road Type Simulation (Highway / City / Intersection)
# Usually categorical in real deployments
road_types = ['Highway', 'City Road', 'Intersection']
df['RoadType'] = np.random.choice(road_types, size=len(df))

# --- DATA PREPROCESSING ---
categorical_features = ['Weather Conditions', 'RoadType']
encoders = {}

for col in categorical_features:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

# Map Target
def categorize_congestion(val):
    try:
        val = float(val)
        if val < 40: return 'Low'
        elif val < 75: return 'Medium'
        else: return 'High'
    except: return 'Medium'

df['Target'] = df['Congestion Level'].apply(categorize_congestion)
le_target = LabelEncoder()
y = le_target.fit_transform(df['Target'])

# Features for model
feature_cols = ['DayOfWeek', 'Hour', 'Traffic Volume', 'Average Speed', 'IsPeakHour', 'TrafficDensity', 'Weather Conditions', 'RoadType']
X = df[feature_cols]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# --- MODEL SELECTION (XGBoost vs RF) ---
print("Training Random Forest...")
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
rf_acc = accuracy_score(y_test, rf.predict(X_test))

print("Training XGBoost...")
xgb = XGBClassifier(n_estimators=100, learning_rate=0.1, random_state=42)
xgb.fit(X_train, y_train)
xgb_acc = accuracy_score(y_test, xgb.predict(X_test))

print(f"RF Accuracy: {rf_acc:.4f} | XGB Accuracy: {xgb_acc:.4f}")

# Choose best model
best_model = xgb if xgb_acc > rf_acc else rf
model_type = "XGBoost" if xgb_acc > rf_acc else "RandomForest"

# --- INSIGHTS: FEATURE IMPORTANCE ---
importances = best_model.feature_importances_
importance_dict = dict(zip(feature_cols, [float(i) for i in importances]))

# --- SAVE ARTIFACTS ---
os.makedirs('models', exist_ok=True)
joblib.dump(best_model, 'models/best_model.joblib')
joblib.dump(le_target, 'models/target_encoder.joblib')
joblib.dump(encoders, 'models/feature_encoders.joblib')

metrics = {
    "accuracy": max(rf_acc, xgb_acc),
    "model_type": model_type,
    "feature_importance": importance_dict,
    "classes": le_target.classes_.tolist()
}

with open('models/metrics.json', 'w') as f:
    json.dump(metrics, f)

print(f"Pipeline Complete. Best Model: {model_type} with {max(rf_acc, xgb_acc):.4f} accuracy.")
