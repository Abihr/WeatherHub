import React, { useState, useEffect } from 'react';
import {
  Train,
  AlertTriangle,
  Clock,
  MapPin,
  RefreshCw,
  AlertCircle,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const MOCK_STATIONS = [
  { id: '1', name: 'Mumbai Central', code: 'BCT', zone: 'Western' },
  { id: '2', name: 'Delhi Junction', code: 'DLI', zone: 'Northern' },
  { id: '3', name: 'Kolkata Howrah', code: 'HWH', zone: 'Eastern' },
  { id: '4', name: 'Chennai Central', code: 'MAS', zone: 'Southern' },
  { id: '5', name: 'Surat', code: 'ST', zone: 'Western' },
  { id: '6', name: 'Patna Junction', code: 'PNBE', zone: 'East Central' },
  { id: '7', name: 'Lucknow Charbagh', code: 'LKO', zone: 'Northern' },
];

const RailwayWeather = () => {
  const [selectedStation, setSelectedStation] = useState('all');
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);

  // Nearby stations state
  const [nearbyMode, setNearbyMode] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Fetch railway weather data from the Vercel API
  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/railway_weather');

      if (!response.ok) {
        throw new Error(
          `Failed to fetch railway weather data (${response.status})`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid railway weather data received');
      }

      setWeatherData(data);
    } catch (error) {
      console.error('Railway weather error:', error);
      setError(error.message || 'Failed to load railway weather data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the page loads
  useEffect(() => {
    fetchWeatherData();
  }, []);

  const filteredData =
    selectedStation === 'all'
      ? weatherData
      : weatherData.filter(
          w => w.stationCode === selectedStation
        );

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return R * c;
  };

  // Find stations nearest to the user's current location
  const findNearbyStations = () => {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError(
        'Geolocation is not supported by your browser.'
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const userLatitude = position.coords.latitude;
        const userLongitude = position.coords.longitude;

        const stationsWithDistance = weatherData
          .filter(
            station =>
              typeof station.latitude === 'number' &&
              typeof station.longitude === 'number'
          )
          .map(station => ({
            ...station,
            distance: calculateDistance(
              userLatitude,
              userLongitude,
              station.latitude,
              station.longitude
            ),
          }))
          .sort(
            (a, b) => a.distance - b.distance
          );

        setWeatherData(stationsWithDistance);
        setSelectedStation('all');
        setNearbyMode(true);
      },
      locationError => {
        console.error(
          'Geolocation error:',
          locationError
        );

        setLocationError(
          'Unable to access your location. Please allow location access.'
        );
      }
    );
  };

  // Reset nearby mode
  const showAllStations = () => {
    setNearbyMode(false);
    setLocationError(null);
    setSelectedStation('all');

    fetchWeatherData();
  };

  // Status helpers
  const getStatusColor = (status) => {
    switch (status) {
      case 'Safe':
        return 'border-green-500';
      case 'Caution':
        return 'border-yellow-500';
      case 'Alert':
        return 'border-orange-500';
      case 'Critical':
        return 'border-red-600';
      default:
        return 'border-gray-500';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'Safe':
        return 'bg-green-50 text-green-700';
      case 'Caution':
        return 'bg-yellow-50 text-yellow-700';
      case 'Alert':
        return 'bg-orange-50 text-orange-700';
      case 'Critical':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getRouteStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-green-100 text-green-800';
      case 'Partially Closed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWaterLevelColor = (level) => {
    if (level === null || level === undefined) {
      return 'text-gray-500';
    }

    if (level > 4) return 'text-red-600';
    if (level > 3) return 'text-orange-500';
    if (level > 2) return 'text-yellow-500';

    return 'text-green-600';
  };

  const hasCriticalAlerts = weatherData.some(
    w => w.weatherStatus === 'Critical'
  );

  const criticalCount = weatherData.filter(
    w => w.weatherStatus === 'Critical'
  ).length;

  const refreshData = () => {
    fetchWeatherData();
    setNearbyMode(false);
    setLocationError(null);
    setSelectedStation('all');
  };

  const toggleExpand = (id) => {
    setExpandedCard(
      expandedCard === id ? null : id
    );
  };

  // Data displayed on the page
  const displayData = nearbyMode
    ? filteredData.filter(
        station =>
          station.distance !== undefined &&
          station.distance <= 100
      )
    : filteredData;

  return (
    <div className="min-h-screen bg-ink-50/50 p-3 sm:p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6">

        <div className="flex items-center gap-3 min-w-0">
          <div className="p-3 bg-sky-100 rounded-xl shrink-0">
            <Train className="w-6 h-6 text-sky-600" />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-ink-900">
              Railway Weather Updates
            </h2>

            <p className="text-xs sm:text-sm text-ink-400">
              Real-time flood alerts & weather monitoring for railway stations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0 w-full sm:w-auto">

          {criticalCount > 0 && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full">
              <AlertCircle className="w-4 h-4" />

              <span className="text-sm font-medium">
                {criticalCount} Critical Alert
                {criticalCount > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium ml-auto"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading ? 'animate-spin' : ''
              }`}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />

          <div>
            <p className="text-red-600 font-medium">
              Failed to load railway weather
            </p>

            <p className="text-sm text-red-500">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Location Error */}
      {locationError && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
          <MapPin className="w-5 h-5 text-yellow-600 shrink-0" />

          <p className="text-sm text-yellow-700">
            {locationError}
          </p>
        </div>
      )}

      {/* Critical Alert Banner */}
      {hasCriticalAlerts && showAlert && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex flex-wrap justify-between items-center gap-3">

          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse shrink-0" />

            <div>
              <p className="text-red-600 font-medium">
                ⚠️ Critical Weather Alert
              </p>

              <p className="text-sm text-ink-500">
                Multiple stations reporting severe weather conditions.
                Immediate attention required.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAlert(false)}
            className="text-ink-400 hover:text-ink-700 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6">

        <select
          value={selectedStation}
          onChange={(e) => {
            setSelectedStation(e.target.value);
            setNearbyMode(false);
          }}
          className="w-full sm:w-auto px-4 py-2.5 bg-white border border-ink-200 rounded-lg text-ink-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-sm"
        >
          <option value="all">
            All Stations ({weatherData.length})
          </option>

          {MOCK_STATIONS.map(station => (
            <option
              key={station.id}
              value={station.code}
            >
              {station.name} ({station.code})
            </option>
          ))}
        </select>

        <div className="flex gap-2 w-full sm:w-auto">

          {!nearbyMode ? (
            <button
              onClick={findNearbyStations}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border border-ink-200 rounded-lg text-ink-600 hover:bg-ink-50 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Nearby Stations
            </button>
          ) : (
            <button
              onClick={showAllStations}
              className="w-full sm:w-auto px-4 py-2.5 bg-sky-100 border border-sky-200 rounded-lg text-sky-700 hover:bg-sky-200 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Show All Stations
            </button>
          )}

        </div>
      </div>

      {/* Nearby information */}
      {nearbyMode && (
        <div className="mb-6 p-3 bg-sky-50 border border-sky-100 rounded-xl text-sm text-sky-700 flex items-center gap-2">
          <MapPin className="w-4 h-4 shrink-0" />

          Showing stations within 100 km of your current location.
        </div>
      )}

      {/* Loading State */}
      {loading && weatherData.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-card">

          <RefreshCw className="w-10 h-10 text-sky-500 mx-auto mb-4 animate-spin" />

          <p className="text-ink-500 text-lg font-medium">
            Loading railway weather...
          </p>

          <p className="text-ink-400 text-sm">
            Fetching the latest station weather data
          </p>

        </div>
      )}

      {/* Stats Summary */}
      {!loading && weatherData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">

          <div className="bg-white rounded-xl p-4 shadow-card">
            <p className="text-sm text-ink-400">
              {nearbyMode ? 'Nearby Stations' : 'Total Stations'}
            </p>

            <p className="text-2xl font-bold text-ink-900">
              {displayData.length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-card">
            <p className="text-sm text-ink-400">
              Critical Alerts
            </p>

            <p
              className={`text-2xl font-bold ${
                criticalCount > 0
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {criticalCount}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-card">
            <p className="text-sm text-ink-400">
              Trains Delayed
            </p>

            <p className="text-2xl font-bold text-yellow-600">
              {weatherData.reduce(
                (sum, w) => sum + (w.trainDelays || 0),
                0
              )}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-card">
            <p className="text-sm text-ink-400">
              Routes Closed
            </p>

            <p className="text-2xl font-bold text-red-600">
              {
                weatherData.filter(
                  w => w.routeStatus === 'Closed'
                ).length
              }
            </p>
          </div>

        </div>
      )}

      {/* Station Cards Grid */}
      {!loading && weatherData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">

          {displayData.map((station) => (

            <div
              key={station.id}
              className={`bg-white rounded-xl p-4 sm:p-5 border-l-4 shadow-card hover:shadow-pop transition-all ${getStatusColor(
                station.weatherStatus
              )}`}
            >

              {/* Header */}
              <div className="flex justify-between items-start gap-2 mb-3">

                <div className="min-w-0">

                  <h3 className="font-display font-semibold text-ink-900 truncate">
                    {station.stationName}
                  </h3>

                  <p className="text-sm text-ink-400">
                    {station.stationCode}
                  </p>

                  {station.distance !== undefined && (
                    <p className="text-xs text-sky-600 mt-1">
                      {station.distance.toFixed(1)} km away
                    </p>
                  )}

                </div>

                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${getStatusBg(
                    station.weatherStatus
                  )}`}
                >
                  {station.weatherStatus}
                </span>

              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-2 mb-3">

                <div className="flex items-center gap-2 text-sm text-ink-600 bg-ink-50 px-3 py-1.5 rounded-lg min-w-0">

                  <Thermometer className="w-4 h-4 text-sky-500 shrink-0" />

                  <span className="truncate">
                    {station.temperature}°C
                  </span>

                </div>

                <div className="flex items-center gap-2 text-sm text-ink-600 bg-ink-50 px-3 py-1.5 rounded-lg min-w-0">

                  <Droplets className="w-4 h-4 text-sky-500 shrink-0" />

                  <span className="truncate">
                    {station.humidity}%
                  </span>

                </div>

                <div className="flex items-center gap-2 text-sm text-ink-600 bg-ink-50 px-3 py-1.5 rounded-lg min-w-0">

                  <CloudRain className="w-4 h-4 text-sky-500 shrink-0" />

                  <span className="truncate">
                    {station.rainfall} mm
                  </span>

                </div>

                <div className="flex items-center gap-2 text-sm text-ink-600 bg-ink-50 px-3 py-1.5 rounded-lg min-w-0">

                  <Wind className="w-4 h-4 text-sky-500 shrink-0" />

                  <span className="truncate">
                    {station.windSpeed} km/h
                  </span>

                </div>

              </div>

              {/* Water Level & Route Status */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center p-3 bg-ink-50 rounded-lg mb-3">

                <div>

                  <p className="text-xs text-ink-400">
                    Water Level
                  </p>

                  <p
                    className={`text-sm font-semibold ${getWaterLevelColor(
                      station.waterLevel
                    )}`}
                  >
                    {station.waterLevel !== null &&
                    station.waterLevel !== undefined
                      ? `${station.waterLevel} m`
                      : 'Unavailable'}
                  </p>

                </div>

                <div className="sm:text-right">

                  <p className="text-xs text-ink-400">
                    Route Status
                  </p>

                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRouteStatusColor(
                      station.routeStatus
                    )}`}
                  >
                    {station.routeStatus || 'Unknown'}
                  </span>

                </div>

              </div>

              {/* Alert Message */}
              {station.alertMessage && (
                <div
                  className={`p-2 rounded-lg text-sm mb-2 ${
                    station.weatherStatus === 'Critical'
                      ? 'bg-red-50 text-red-600'
                      : station.weatherStatus === 'Alert'
                      ? 'bg-orange-50 text-orange-600'
                      : 'bg-yellow-50 text-yellow-600'
                  }`}
                >
                  {station.alertMessage}
                </div>
              )}

              {/* Train Delays */}
              {station.trainDelays !== null &&
                station.trainDelays !== undefined &&
                station.trainDelays > 0 && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg">

                    <Clock className="w-4 h-4 shrink-0" />

                    <span>
                      {station.trainDelays} trains delayed
                    </span>

                  </div>
                )}

              {/* Expandable Details */}
              <button
                onClick={() => toggleExpand(station.id)}
                className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-ink-400 hover:text-ink-600 transition-colors py-1"
              >

                {expandedCard === station.id ? (
                  <>
                    Hide Details
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    View Details
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}

              </button>

              {expandedCard === station.id && (
                <div className="mt-3 p-3 bg-ink-50 rounded-lg space-y-2 text-sm">

                  <div className="flex justify-between gap-3">

                    <span className="text-ink-400">
                      Station Code
                    </span>

                    <span className="text-ink-700 font-medium">
                      {station.stationCode}
                    </span>

                  </div>

                  <div className="flex justify-between gap-3">

                    <span className="text-ink-400">
                      Zone
                    </span>

                    <span className="text-ink-700 font-medium">
                      {MOCK_STATIONS.find(
                        s => s.code === station.stationCode
                      )?.zone || 'N/A'}
                    </span>

                  </div>

                  {station.distance !== undefined && (
                    <div className="flex justify-between gap-3">

                      <span className="text-ink-400">
                        Distance
                      </span>

                      <span className="text-ink-700 font-medium">
                        {station.distance.toFixed(1)} km
                      </span>

                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">

                    <span className="text-ink-400">
                      Last Updated
                    </span>

                    <span className="text-ink-700 font-medium sm:text-right">
                      {station.lastUpdated
                        ? new Date(
                            station.lastUpdated
                          ).toLocaleString()
                        : 'Unavailable'}
                    </span>

                  </div>

                </div>
              )}

              {/* Last Updated */}
              <div className="text-xs text-ink-400 mt-2">

                Updated:{' '}

                {station.lastUpdated
                  ? new Date(
                      station.lastUpdated
                    ).toLocaleTimeString()
                  : 'Unavailable'}

              </div>

            </div>
          ))}

        </div>
      )}

      {/* Nearby Empty State */}
      {!loading &&
        nearbyMode &&
        weatherData.length > 0 &&
        displayData.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-card">

            <MapPin className="w-16 h-16 text-ink-300 mx-auto mb-4" />

            <p className="text-ink-500 text-lg font-medium">
              No nearby stations found
            </p>

            <p className="text-ink-400 text-sm mt-1">
              None of the currently available stations are within 100 km.
            </p>

            <button
              onClick={showAllStations}
              className="mt-4 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600 transition-colors"
            >
              Show All Stations
            </button>

          </div>
        )}

      {/* Empty State */}
      {!loading &&
        weatherData.length > 0 &&
        !nearbyMode &&
        filteredData.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-card">

            <Train className="w-20 h-20 text-ink-300 mx-auto mb-4" />

            <p className="text-ink-500 text-lg font-medium">
              No railway weather updates available
            </p>

            <p className="text-ink-400 text-sm">
              Try selecting a different station or refresh the page
            </p>

          </div>
        )}

      {/* Legend */}
      <div className="mt-8 p-4 bg-white rounded-xl shadow-card">

        <h4 className="text-sm font-medium text-ink-500 mb-2">
          Status Legend
        </h4>

        <div className="flex flex-wrap gap-3 sm:gap-4">

          <div className="flex items-center gap-2 text-sm text-ink-600">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Safe
          </div>

          <div className="flex items-center gap-2 text-sm text-ink-600">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            Caution
          </div>

          <div className="flex items-center gap-2 text-sm text-ink-600">
            <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
            Alert
          </div>

          <div className="flex items-center gap-2 text-sm text-ink-600">
            <span className="w-3 h-3 bg-red-600 rounded-full"></span>
            Critical
          </div>

          <div className="flex items-center gap-2 text-sm text-ink-600 sm:ml-4">
            <span className="w-8 h-0.5 bg-green-500"></span>
            Route Open
          </div>

          <div className="flex items-center gap-2 text-sm text-ink-600">
            <span className="w-8 h-0.5 bg-yellow-500"></span>
            Partially Closed
          </div>

          <div className="flex items-center gap-2 text-sm text-ink-600">
            <span className="w-8 h-0.5 bg-red-600"></span>
            Route Closed
          </div>

        </div>
      </div>

    </div>
  );
};

export default RailwayWeather;