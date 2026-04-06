# Traffic Congestion Prediction System MVP

This is a full-stack web application that predicts traffic congestion levels (Low, Medium, High) using a real-world dataset from Bangalore and a Random Forest machine learning model.

## 🚀 Tech Stack
- **Frontend:** React (Vite), Recharts, Tailwind CSS, Axios
- **Backend:** FastAPI (Python), Scikit-Learn, Pandas
- **Machine Learning:** Random Forest Classifier
- **Dataset:** [Bangalore's Traffic Pulse](https://github.com/nachimuthu2906/bengaluru-traffic-analysis) (Real-world public dataset)

## 📁 Project Structure
- `backend/`: FastAPI server, model training, and artifacts.
- `frontend/`: React dashboard.
- `data/`: Real-world CSV dataset.

## 🛠️ Setup Instructions

### 1. Backend Setup
```bash
# From the root directory
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt  # Or manually install: fastapi uvicorn pandas scikit-learn joblib

# Train the model
cd backend
python train.py

# Start the API server
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
# Open a new terminal
cd frontend
npm install
npm run dev
```

## 🧠 How the Prediction Works
1. **Data Preprocessing:** The system loads the Bangalore Traffic Dataset. It extracts features like `Day of Week` from the date and uses `Traffic Volume` and `Average Speed` as predictors.
2. **Labeling:** Raw congestion levels (percentage) are categorized into:
   - **Low:** < 40%
   - **Medium:** 40% - 75%
   - **High:** > 75%
3. **Model:** A Random Forest Classifier is trained on 80% of the data. It achieves ~92% accuracy in classifying the congestion state.
4. **API:** The React frontend sends the user's input (day, volume, speed) to the FastAPI endpoint, which returns the predicted class (Low/Medium/High).

## 📊 Visualizations
The dashboard includes:
- **Average Traffic Volume per Day:** Shows which days are typically the busiest.
- **Speed vs Volume Correlation:** A scatter plot showing how speed decreases as traffic volume increases.
- **Model Performance:** Displays the real-time accuracy of the trained model.



How to Switch Models
  The project automatically selects the best-performing model between RandomForest and XGBoost during training. To switch or force a specific model, follow these steps:

   1. Manual Switch: 
      Open backend/train.py and modify the "Choose best model" section (around line 96).
       * To force XGBoost: Change to best_model = xgb.
       * To force RandomForest: Change to best_model = rf.

   2. Retrain the Pipeline: 
      After making changes, run the training script from the backend directory:
   1     cd backend
   2     ../venv/bin/python train.py

   3. Restart the Backend:
      The backend loads the model at startup. Restart it to apply the changes:
   1     cd backend
   2     ../venv/bin/uvicorn main:app --reload --host 0.0.0.0

  Note: If you want to use a completely different model (e.g., Logistic Regression), you would need to import it from sklearn, fit it in train.py, and save it as best_model.joblib.
