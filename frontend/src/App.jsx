import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { AlertCircle, TrendingUp, BarChart2, Activity } from 'lucide-react';

const API_URL = `http://${window.location.hostname}:8000`;

const App = () => {
  const [inputs, setInputs] = useState({
    time: '08:00',
    day: 1, // Monday
    vehicleCount: 5000,
    speed: 45.0
  });
  const [prediction, setPrediction] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [dataSample, setDataSample] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMetrics();
    fetchData();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await axios.get(`${API_URL}/metrics`);
      setMetrics(res.data);
    } catch (e) { console.error("Error fetching metrics", e); }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/data`);
      setDataSample(res.data.data || []);
    } catch (e) { console.error("Error fetching data", e); }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/predict`, inputs);
      setPrediction(res.data.congestionLevel);
    } catch (e) {
      console.error("Prediction failed", e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (level) => {
    if (level === 'Low') return 'text-green-600 bg-green-100';
    if (level === 'Medium') return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="text-blue-600" /> Traffic Congestion Predictor (MVP)
        </h1>
        <p className="text-gray-600 mt-2">Real-world data driven insights for urban mobility</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" /> Predict Congestion
          </h2>
          <form onSubmit={handlePredict} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Day of Week</label>
              <select 
                className="mt-1 block w-full p-2 border rounded-md"
                value={inputs.day}
                onChange={(e) => setInputs({...inputs, day: parseInt(e.target.value)})}
              >
                {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle Count (Volume)</label>
              <input 
                type="number" 
                className="mt-1 block w-full p-2 border rounded-md"
                value={inputs.vehicleCount}
                onChange={(e) => setInputs({...inputs, vehicleCount: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Avg Speed (km/h)</label>
              <input 
                type="number" 
                step="0.1"
                className="mt-1 block w-full p-2 border rounded-md"
                value={inputs.speed}
                onChange={(e) => setInputs({...inputs, speed: parseFloat(e.target.value)})}
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Predict Status'}
            </button>
          </form>

          {prediction && (
            <div className={`mt-6 p-4 rounded-lg text-center ${getStatusColor(prediction)}`}>
              <p className="text-sm font-medium opacity-80">Predicted Congestion Level</p>
              <p className="text-2xl font-bold">{prediction}</p>
            </div>
          )}
        </section>

        {/* Graphs & Metrics Panel */}
        <div className="lg:col-span-2 space-y-8">
          {/* Metrics & EDA Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Model Accuracy (Random Forest)</h3>
              <p className="text-3xl font-bold text-blue-600">
                {metrics ? (metrics.accuracy * 100).toFixed(1) : '--'}%
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Dataset Sample Size</h3>
              <p className="text-3xl font-bold text-gray-800">8,937 Records</p>
            </div>
          </div>

          {/* Chart 1: Volume vs Day */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[300px]">
             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
               <BarChart2 size={18} className="text-blue-500" /> Avg Traffic Volume per Day
             </h3>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={days.map((day, i) => ({
                 day,
                 volume: dataSample.filter(d => d.DayOfWeek === i).reduce((acc, curr) => acc + curr['Traffic Volume'], 0) / (dataSample.filter(d => d.DayOfWeek === i).length || 1)
               }))}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="day" />
                 <YAxis />
                 <Tooltip />
                 <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>

          {/* Chart 2: Speed vs Congestion (Scatter) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[300px]">
             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
               <AlertCircle size={18} className="text-blue-500" /> Speed vs Congestion Correlation
             </h3>
             <ResponsiveContainer width="100%" height="100%">
               <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                 <CartesianGrid />
                 <XAxis type="number" dataKey="Average Speed" name="Speed" unit="km/h" label={{ value: 'Speed', position: 'insideBottom', offset: -5 }} />
                 <YAxis type="number" dataKey="Traffic Volume" name="Volume" label={{ value: 'Volume', angle: -90, position: 'insideLeft' }} />
                 <ZAxis type="category" dataKey="Congestion Category" name="Status" />
                 <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                 <Scatter name="Traffic Points" data={dataSample} fill="#8884d8" opacity={0.6} />
               </ScatterChart>
             </ResponsiveContainer>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 text-center text-gray-500 text-sm">
        <p>© 2026 Traffic Prediction System MVP - Using Public Bangalore Traffic Dataset</p>
      </footer>
    </div>
  );
};

export default App;
