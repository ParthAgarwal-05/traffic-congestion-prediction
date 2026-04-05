import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib
import os
import json

print("Loading data...")
# Read data
df = pd.read_csv('../data/traffic.csv')

# Handle missing values
df = df.dropna()

# Extract Day of Week from Date (0 = Monday, 6 = Sunday)
df['Date'] = pd.to_datetime(df['Date'], format='%d-%m-%Y', errors='coerce')
df = df.dropna(subset=['Date'])
df['DayOfWeek'] = df['Date'].dt.dayofweek

# We use features: DayOfWeek, Traffic Volume, Average Speed
features = ['DayOfWeek', 'Traffic Volume', 'Average Speed']
X = df[features]

# Target: The dataset has 'Congestion Level' as a percentage (e.g. 100, 28.3)
# We convert it to Low, Medium, High categories based on thresholds
def categorize_congestion(val):
    try:
        val = float(val)
        if val < 40:
            return 'Low'
        elif val < 75:
            return 'Medium'
        else:
            return 'High'
    except:
        return 'Medium'

df['Congestion Category'] = df['Congestion Level'].apply(categorize_congestion)

le = LabelEncoder()
y = le.fit_transform(df['Congestion Category'])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training RandomForest model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"Model Accuracy: {acc:.4f}")

# Save models and metrics
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/rf_model.joblib')
joblib.dump(le, 'models/label_encoder.joblib')

metrics = {"accuracy": acc}
with open('models/metrics.json', 'w') as f:
    json.dump(metrics, f)

print("Model and metrics saved successfully.")