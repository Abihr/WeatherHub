import React, { useEffect, useState } from 'react';
import { 
  Sprout, 
  Droplets, 
  Thermometer, 
  Wind, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Tractor,
  CloudRain,
  Sun,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { getGreeting, getGreetingRefreshDelay } from '../utils/greeting';

// Mock Data - Replace with API calls later
const MOCK_FARMER_DATA = {
  farmDetails: {
    name: "Green Valley Farm",
    location: "Pune, Maharashtra",
    area: "12 Acres",
    soilType: "Black Soil",
    crops: ["Wheat", "Sugarcane", "Cotton"]
  },
  weatherForecast: {
    today: {
      temp: 32,
      humidity: 65,
      rainfall: 0,
      windSpeed: 8,
      condition: "Sunny"
    },
    week: [
      { day: "Mon", temp: 32, rain: 0, condition: "Sunny" },
      { day: "Tue", temp: 30, rain: 5, condition: "Partly Cloudy" },
      { day: "Wed", temp: 28, rain: 15, condition: "Light Rain" },
      { day: "Thu", temp: 26, rain: 45, condition: "Heavy Rain" },
      { day: "Fri", temp: 27, rain: 20, condition: "Cloudy" },
      { day: "Sat", temp: 29, rain: 0, condition: "Sunny" },
      { day: "Sun", temp: 31, rain: 0, condition: "Sunny" }
    ]
  },
  cropRecommendations: [
    {
      crop: "Wheat",
      action: "Sowing",
      timing: "Next 3 days",
      confidence: "85%",
      recommendation: "Good time for sowing as rainfall is expected."
    },
    {
      crop: "Sugarcane",
      action: "Harvesting",
      timing: "Next 5-7 days",
      confidence: "72%",
      recommendation: "Wait for 2 days. Heavy rain expected on Thursday."
    },
    {
      crop: "Cotton",
      action: "Irrigation",
      timing: "Today",
      confidence: "90%",
      recommendation: "High temperature. Irrigate today before 10 AM."
    }
  ],
  alerts: [
    {
      type: "Weather Alert",
      message: "Heavy rainfall expected on Thursday (45mm)",
      priority: "High",
      date: "2026-09-10"
    },
    {
      type: "Pest Alert",
      message: "High humidity may cause fungal infection in wheat",
      priority: "Medium",
      date: "2026-09-08"
    },
    {
      type: "Irrigation Alert",
      message: "No rain predicted for next 3 days. Plan irrigation.",
      priority: "Low",
      date: "2026-09-07"
    }
  ],
  yieldPrediction: {
    wheat: { predicted: "4.2 tons/acre", lastYear: "3.8 tons/acre", change: "+10.5%" },
    sugarcane: { predicted: "42 tons/acre", lastYear: "38 tons/acre", change: "+10.5%" },
    cotton: { predicted: "2.8 tons/acre", lastYear: "2.5 tons/acre", change: "+12%" }
  }
};

const FarmerDashboard = () => {
  const [farmerData] = useState(MOCK_FARMER_DATA);
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [currentGreeting, setCurrentGreeting] = useState(getGreeting());

  const getWeatherIcon = (condition) => {
    switch(condition) {
      case 'Sunny': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'Partly Cloudy': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'Cloudy': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'Light Rain': return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'Heavy Rain': return <CloudRain className="w-6 h-6 text-blue-700" />;
      default: return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const filteredRecommendations = selectedCrop === 'all' 
    ? farmerData.cropRecommendations 
    : farmerData.cropRecommendations.filter(r => r.crop === selectedCrop);

  useEffect(() => {
    let timer;

    const scheduleGreetingRefresh = () => {
      timer = window.setTimeout(() => {
        setCurrentGreeting(getGreeting());
        scheduleGreetingRefresh();
      }, getGreetingRefreshDelay());
    };

    scheduleGreetingRefresh();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-ink-50/50 p-6">
      <section className="mb-6 rounded-xl bg-gradient-to-r from-sky-100 via-white to-green-50 p-5 shadow-card border border-sky-100">
        <p className="text-sm text-ink-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <h2 className="mt-1 text-2xl font-display font-bold text-ink-900">{currentGreeting}, Farmer</h2>
        <p className="mt-1 text-sm text-ink-500">Here is your farm plan and weather outlook for today.</p>
      </section>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <Sprout className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-ink-900">Farmer Dashboard</h2>
            <p className="text-sm text-ink-400">Crop-specific weather alerts & farming recommendations</p>
          </div>
        </div>
        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Farm Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-card border-l-4 border-green-500">
          <p className="text-sm text-ink-400">Farm Name</p>
          <p className="text-lg font-semibold text-ink-900">{farmerData.farmDetails.name}</p>
          <p className="text-sm text-ink-400">{farmerData.farmDetails.location}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card border-l-4 border-blue-500">
          <p className="text-sm text-ink-400">Area</p>
          <p className="text-lg font-semibold text-ink-900">{farmerData.farmDetails.area}</p>
          <p className="text-sm text-ink-400">Soil: {farmerData.farmDetails.soilType}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card border-l-4 border-yellow-500">
          <p className="text-sm text-ink-400">Active Crops</p>
          <p className="text-lg font-semibold text-ink-900">{farmerData.farmDetails.crops.length}</p>
          <p className="text-sm text-ink-400">{farmerData.farmDetails.crops.join(', ')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card border-l-4 border-purple-500">
          <p className="text-sm text-ink-400">Today's Weather</p>
          <div className="flex items-center gap-2">
            {getWeatherIcon(farmerData.weatherForecast.today.condition)}
            <p className="text-lg font-semibold text-ink-900">{farmerData.weatherForecast.today.temp}°C</p>
          </div>
          <p className="text-sm text-ink-400">{farmerData.weatherForecast.today.condition}</p>
        </div>
      </div>

      {/* Weather Forecast */}
      <div className="bg-white rounded-xl p-5 shadow-card mb-6">
        <h3 className="font-display font-semibold text-ink-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          7-Day Weather Forecast
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {farmerData.weatherForecast.week.map((day, index) => (
            <div key={index} className="text-center p-2 rounded-lg hover:bg-ink-50 transition-colors">
              <p className="text-xs text-ink-400 font-medium">{day.day}</p>
              <div className="flex justify-center my-1">{getWeatherIcon(day.condition)}</div>
              <p className="text-sm font-semibold text-ink-900">{day.temp}°C</p>
              {day.rain > 0 ? (
                <p className="text-xs text-blue-500">{day.rain}mm</p>
              ) : (
                <p className="text-xs text-ink-400">☀️</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white rounded-xl p-5 shadow-card mb-6">
        <h3 className="font-display font-semibold text-ink-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Alerts & Recommendations
        </h3>
        <div className="space-y-3">
          {farmerData.alerts.map((alert, index) => (
            <div key={index} className={`p-3 rounded-lg ${getPriorityColor(alert.priority)} flex items-start gap-3`}>
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{alert.type}</p>
                <p className="text-sm">{alert.message}</p>
                <p className="text-xs opacity-70">{alert.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crop Recommendations */}
      <div className="bg-white rounded-xl p-5 shadow-card mb-6">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h3 className="font-display font-semibold text-ink-900 flex items-center gap-2">
            <Tractor className="w-5 h-5 text-green-500" />
            Crop Recommendations
          </h3>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-1.5 bg-ink-50 border border-ink-200 rounded-lg text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="all">All Crops</option>
            {farmerData.farmDetails.crops.map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredRecommendations.map((rec, index) => (
            <div key={index} className="p-4 bg-ink-50 rounded-xl border border-ink-100">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-ink-900">{rec.crop}</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  rec.confidence === '90%' ? 'bg-green-100 text-green-700' :
                  rec.confidence === '85%' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {rec.confidence}
                </span>
              </div>
              <p className="text-sm text-ink-600"><strong>Action:</strong> {rec.action}</p>
              <p className="text-sm text-ink-600"><strong>Timing:</strong> {rec.timing}</p>
              <p className="text-sm text-ink-500 mt-2">{rec.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Yield Prediction */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="font-display font-semibold text-ink-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Yield Prediction
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(farmerData.yieldPrediction).map(([crop, data]) => (
            <div key={crop} className="p-4 bg-green-50 rounded-xl border border-green-100">
              <h4 className="font-semibold text-ink-900 capitalize">{crop}</h4>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="text-xs text-ink-400">Predicted</p>
                  <p className="text-lg font-bold text-green-600">{data.predicted}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-400">Last Year</p>
                  <p className="text-sm text-ink-600">{data.lastYear}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>{data.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;