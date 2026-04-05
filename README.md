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
