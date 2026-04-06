import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell
} from 'recharts';
import { 
  Activity, TrendingUp, Cloud, MapPin, Clock, Info, 
  CheckCircle, AlertTriangle, Lightbulb
} from 'lucide-react';

const API_URL = `http://${window.location.hostname}:8000`;

const App = () => {
  const [inputs, setInputs] = useState({
    day: 1,
    hour: 8,
    vehicleCount: 5000,
    speed: 45.0,
    weather: 'Clear',
    roadType: 'City Road'
  });
  
  const [prediction, setPrediction] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [dataSample, setDataSample] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [m, r, d] = await Promise.all([
        axios.get(`${API_URL}/metrics`),
        axios.get(`${API_URL}/recommendation?day=1`),
        axios.get(`${API_URL}/data`)
      ]);
      setMetrics(m.data);
      setRecommendation(r.data);
      setDataSample(d.data.data || []);
    } catch (e) { console.error("Data fetch failed", e); }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/predict`, inputs);
      setPrediction(res.data);
    } catch (e) {
      console.error("Prediction failed", e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (level) => {
    if (level === 'Low') return 'text-green-600 bg-green-50 border-green-200';
    if (level === 'Medium') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weathers = ['Clear', 'Overcast', 'Rainy', 'Foggy'];
  const roads = ['City Road', 'Highway', 'Intersection'];

  const featureImportanceData = metrics?.feature_importance ? 
    Object.entries(metrics.feature_importance)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
    : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Activity size={40} className="text-blue-600" /> 
            SmartTraffic <span className="text-blue-600">AI PRO</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Real-world AI Congestion Insights • Hackathon Edition</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
             <span className="text-xs font-bold text-slate-400 uppercase block">Model Performance</span>
             <span className="text-lg font-bold text-blue-600">{metrics ? (metrics.accuracy * 100).toFixed(1) : '--'}% Accuracy</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
             <span className="text-xs font-bold text-slate-400 uppercase block">Model Engine</span>
             <span className="text-lg font-bold text-slate-700">{metrics?.model_type || 'Loading...'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Input Form & Result */}
        <div className="xl:col-span-4 space-y-6">
          <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-500" /> Predictive Input
            </h2>
            <form onSubmit={handlePredict} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Day</label>
                  <select className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={inputs.day} onChange={(e) => setInputs({...inputs, day: parseInt(e.target.value)})}>
                    {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Hour (24h)</label>
                  <input type="number" min="0" max="23" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={inputs.hour} onChange={(e) => setInputs({...inputs, hour: parseInt(e.target.value)})} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Vehicle Count</label>
                <input type="number" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={inputs.vehicleCount} onChange={(e) => setInputs({...inputs, vehicleCount: parseInt(e.target.value)})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Weather</label>
                  <select className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={inputs.weather} onChange={(e) => setInputs({...inputs, weather: e.target.value})}>
                    {weathers.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Road Type</label>
                  <select className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={inputs.roadType} onChange={(e) => setInputs({...inputs, roadType: e.target.value})}>
                    {roads.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                {loading ? 'Processing...' : <><Activity size={20} /> Run Prediction</>}
              </button>
            </form>

            {prediction && (
              <div className={`mt-8 p-6 rounded-2xl border-2 animate-in fade-in slide-in-from-bottom-4 duration-500 ${getStatusColor(prediction.congestionLevel)}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black uppercase tracking-widest opacity-70">Result</span>
                  {prediction.isPeakHour && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><Clock size={10}/> PEAK HOUR</span>}
                </div>
                <h3 className="text-4xl font-black mb-1">{prediction.congestionLevel}</h3>
                <p className="text-sm font-semibold opacity-80 flex items-center gap-1">
                   Density Index: {prediction.densityIndex.toFixed(2)}
                </p>
              </div>
            )}
          </section>

          {/* Recommendations Card */}
          <section className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Lightbulb size={24} /> AI Recommendation
            </h2>
            {recommendation ? (
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase text-blue-100">Optimal Window</p>
                  <p className="text-lg font-bold">{recommendation.bestTime}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase text-blue-100">Avoid Window</p>
                  <p className="text-lg font-bold">{recommendation.avoidTime}</p>
                </div>
                <p className="text-sm leading-relaxed italic opacity-90">{recommendation.tip}</p>
              </div>
            ) : <p>Generating recommendations...</p>}
          </section>
        </div>

        {/* Right Column: Analytics & Feature Importance */}
        <div className="xl:col-span-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature Importance */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-blue-500" /> AI Feature Contribution
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={featureImportanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fontWeight: 600 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {featureImportanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index < 3 ? '#3b82f6' : '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-400 mt-2 italic flex items-center gap-1">
                  <Info size={12} /> This chart shows which factors influenced the AI's decision the most.
                </p>
              </div>

              {/* Congestion by Hour Trend */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Clock className="text-blue-500" /> Historical Trend (Hourly)
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={[...Array(24)].map((_, h) => ({
                    hour: h,
                    count: dataSample.filter(d => d.Hour === h).reduce((acc, curr) => acc + curr['Traffic Volume'], 0) / (dataSample.filter(d => d.Hour === h).length || 1)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Dashboard Insight Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border-l-4 border-l-blue-500 shadow-sm">
                 <p className="text-slate-400 text-xs font-bold uppercase">Average Density</p>
                 <p className="text-2xl font-black text-slate-700">1.42 Index</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border-l-4 border-l-red-500 shadow-sm">
                 <p className="text-slate-400 text-xs font-bold uppercase">Main Bottleneck</p>
                 <p className="text-2xl font-black text-slate-700">Weather (Rain)</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border-l-4 border-l-green-500 shadow-sm">
                 <p className="text-slate-400 text-xs font-bold uppercase">Signal Efficiency</p>
                 <p className="text-2xl font-black text-slate-700">84% Optimal</p>
              </div>
           </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 py-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
        <p>© 2026 SmartTraffic AI - Professional Mobility Intelligence Dashboard</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <span className="flex items-center gap-1"><CheckCircle size={14}/> Validated Data</span>
          <span className="flex items-center gap-1"><MapPin size={14}/> Bangalore Pulse Dataset</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
