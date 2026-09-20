import React, { useEffect, useMemo, useState } from 'react';
import { 
  Sprout, Droplets, Thermometer, Wind, Calendar, 
  AlertTriangle, TrendingUp, Tractor, CloudRain, 
  Sun, Cloud, RefreshCw, MapPin, Leaf, Bug, 
  IndianRupee, Package, Scissors,
  CloudSun, Umbrella, Snowflake, Waves,
  ChevronRight, Info, CheckCircle, XCircle,
  Star, Award, Target, BarChart3, Languages
  , Bell, Smartphone
} from 'lucide-react';

const MOCK_FARMER_DATA = {
  farmDetails: {
    name: "Green Valley Farm",
    location: "Pune, Maharashtra",
    area: "12 Acres",
    soilType: "Black Soil",
    crops: ["Wheat", "Sugarcane", "Cotton"],
    farmerName: "Ramesh Patil"
  },
  weatherForecast: {
    today: {
      temp: 32,
      humidity: 65,
      rainfall: 0,
      windSpeed: 8,
      condition: "Sunny",
      feelsLike: 35,
      uvIndex: 7,
      soilMoisture: 45
    },
    week: [
      { day: "Mon", temp: 32, rain: 0, condition: "Sunny", icon: "☀️" },
      { day: "Tue", temp: 30, rain: 5, condition: "Partly Cloudy", icon: "⛅" },
      { day: "Wed", temp: 28, rain: 15, condition: "Light Rain", icon: "🌦️" },
      { day: "Thu", temp: 26, rain: 45, condition: "Heavy Rain", icon: "🌧️" },
      { day: "Fri", temp: 27, rain: 20, condition: "Cloudy", icon: "☁️" },
      { day: "Sat", temp: 29, rain: 0, condition: "Sunny", icon: "☀️" },
      { day: "Sun", temp: 31, rain: 0, condition: "Sunny", icon: "☀️" }
    ]
  },
  cropRecommendations: [
    {
      crop: "Wheat",
      cropIcon: "🌾",
      action: "Sowing",
      actionIcon: "🌱",
      timing: "Next 3 days",
      confidence: "85%",
      recommendation: "Good time to sow wheat. Light rain expected will help seeds grow.",
      simpleTip: "बीज बोने का सही समय है",
      color: "green"
    },
    {
      crop: "Sugarcane",
      cropIcon: "🎋",
      action: "Harvesting",
      actionIcon: "✂️",
      timing: "Next 5-7 days",
      confidence: "72%",
      recommendation: "Wait for 2 days. Heavy rain expected on Thursday.",
      simpleTip: "2 दिन रुकें, बारिश आने वाली है",
      color: "amber"
    },
    {
      crop: "Cotton",
      cropIcon: "🌿",
      action: "Irrigation",
      actionIcon: "💧",
      timing: "Today",
      confidence: "90%",
      recommendation: "High temperature. Water your cotton crop today before 10 AM.",
      simpleTip: "आज सुबह 10 बजे से पहले पानी दें",
      color: "blue"
    }
  ],
  alerts: [
    {
      type: "Heavy Rain Alert",
      typeIcon: "🌧️",
      message: "Heavy rainfall expected on Thursday (45mm)",
      simpleMessage: "गुरुवार को तेज़ बारिश होगी",
      priority: "High",
      date: "2026-09-10",
      action: "Prepare drainage in fields"
    },
    {
      type: "Pest Warning",
      typeIcon: "🐛",
      message: "High humidity may cause fungal infection in wheat",
      simpleMessage: "नमी से गेहूं में फंगस लग सकता है",
      priority: "Medium",
      date: "2026-09-08",
      action: "Spray fungicide if needed"
    },
    {
      type: "Irrigation Reminder",
      typeIcon: "💧",
      message: "No rain predicted for next 3 days. Plan irrigation.",
      simpleMessage: "3 दिन बारिश नहीं होगी, पानी दें",
      priority: "Low",
      date: "2026-09-07",
      action: "Water your crops"
    }
  ],
  yieldPrediction: {
    wheat: { 
      predicted: "4.2 tons/acre", 
      lastYear: "3.8 tons/acre", 
      change: "+10.5%",
      icon: "🌾",
      status: "Good"
    },
    sugarcane: { 
      predicted: "42 tons/acre", 
      lastYear: "38 tons/acre", 
      change: "+10.5%",
      icon: "🎋",
      status: "Good"
    },
    cotton: { 
      predicted: "2.8 tons/acre", 
      lastYear: "2.5 tons/acre", 
      change: "+12%",
      icon: "🌿",
      status: "Excellent"
    }
  },
  marketPrices: [
    { crop: "Wheat", icon: "🌾", price: "₹2,100", unit: "per quintal", trend: "up", change: "+5%" },
    { crop: "Sugarcane", icon: "🎋", price: "₹350", unit: "per quintal", trend: "stable", change: "0%" },
    { crop: "Cotton", icon: "🌿", price: "₹6,800", unit: "per quintal", trend: "up", change: "+8%" }
  ]
};


// ============================================================
// FUNCTIONALITY ENGINE FROM THE SECOND DASHBOARD
// ============================================================
const generateCropRecommendation = (crop, weather) => {
  const rainfall = Number(weather?.rainfall || 0);
  const temperature = Number(weather?.temperature || 0);
  const humidity = Number(weather?.humidity || 0);
  const windSpeed = Number(weather?.windSpeed || 0);

  if (crop === 'Wheat') {
    if (rainfall > 10) {
      return { action: 'Drainage', message: 'Significant rainfall detected. Check field drainage.', timing: 'Next 3 days', icon: '🌧️' };
    }
    if (temperature >= 32) {
      return { action: 'Monitoring', message: 'High temperature detected. Monitor the wheat field closely.', timing: 'Next 3 days', icon: '🌡️' };
    }
    if (humidity >= 80) {
      return { action: 'Disease Monitoring', message: 'High humidity may increase disease risk. Inspect wheat leaves.', timing: 'Next 3 days', icon: '⚠️' };
    }
    return { action: 'Monitoring', message: 'Weather is suitable. Continue normal crop monitoring.', timing: 'Next 5-7 days', icon: '🌱' };
  }

  if (crop === 'Sugarcane') {
    if (rainfall > 15) {
      return { action: 'Drainage', message: 'Heavy rainfall detected. Check sugarcane field drainage.', timing: 'Next 3 days', icon: '🌧️' };
    }
    if (temperature >= 35) {
      return { action: 'Irrigation', message: 'High temperature may increase water requirement.', timing: 'Next 3 days', icon: '💧' };
    }
    if (windSpeed >= 25) {
      return { action: 'Monitoring', message: 'Higher wind speed detected. Monitor the field for crop stress.', timing: 'Next 3 days', icon: '💨' };
    }
    return { action: 'Monitoring', message: 'Current weather is suitable. Continue normal crop monitoring.', timing: 'Next 5-7 days', icon: '🌱' };
  }

  if (crop === 'Cotton') {
    if (rainfall > 10) {
      return { action: 'Drainage', message: 'Rainfall detected. Check cotton field drainage.', timing: 'Next 3 days', icon: '🌧️' };
    }
    if (temperature >= 35) {
      return { action: 'Irrigation', message: 'High temperature may increase cotton water requirement.', timing: 'Next 3 days', icon: '💧' };
    }
    if (humidity >= 80) {
      return { action: 'Disease Monitoring', message: 'High humidity may increase disease risk. Inspect cotton plants.', timing: 'Next 3 days', icon: '⚠️' };
    }
    return { action: 'Monitoring', message: 'Weather is favorable. Continue normal cotton monitoring.', timing: 'Next 5-7 days', icon: '🌱' };
  }

  return { action: 'Monitoring', message: 'Continue normal field monitoring.', timing: 'Next 5-7 days', icon: '🌱' };
};

const FarmerDashboard = () => {
  const [farmerData] = useState(MOCK_FARMER_DATA);
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [language, setLanguage] = useState('en');
  const [phoneAlertsEnabled, setPhoneAlertsEnabled] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('farmer-completed-tasks') || '[]');
    } catch {
      return [];
    }
  });

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिंदी' },
    { value: 'bn', label: 'বাংলা' },
    { value: 'ta', label: 'தமிழ்' },
    { value: 'te', label: 'తెలుగు' },
    { value: 'mr', label: 'मराठी' },
    { value: 'gu', label: 'ગુજરાતી' },
    { value: 'kn', label: 'ಕನ್ನಡ' },
    { value: 'ml', label: 'മലയാളം' },
    { value: 'pa', label: 'ਪੰਜਾਬੀ' },
    { value: 'ur', label: 'اردو' },
    { value: 'or', label: 'ଓଡ଼ିଆ' }
  ];

  const localeMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    bn: 'bn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    pa: 'pa-IN',
    ur: 'ur-IN',
    or: 'or-IN'
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('farmer-preferred-language');
    if (languageOptions.some((option) => option.value === savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('farmer-preferred-language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('farmer-completed-tasks', JSON.stringify(completedTasks));
  }, [completedTasks]);

  useEffect(() => {
    const savedPhoneAlerts = localStorage.getItem('farmer-phone-alerts') === 'enabled';
    const permissionGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted';
    setPhoneAlertsEnabled(savedPhoneAlerts && permissionGranted);
  }, []);

  const phoneAlertCopy = {
    en: { title: 'Phone Alerts', hint: 'Get important weather alerts on this phone', enable: 'Enable phone alerts', enabled: 'Phone alerts are on', blocked: 'Allow notifications in your browser settings' },
    hi: { title: 'फोन अलर्ट', hint: 'इस फोन पर मौसम की जरूरी सूचनाएं पाएं', enable: 'फोन अलर्ट चालू करें', enabled: 'फोन अलर्ट चालू हैं', blocked: 'ब्राउज़र सेटिंग में सूचनाओं की अनुमति दें' },
    bn: { title: 'ফোন সতর্কতা', hint: 'এই ফোনে গুরুত্বপূর্ণ আবহাওয়ার সতর্কতা পান', enable: 'ফোন সতর্কতা চালু করুন', enabled: 'ফোন সতর্কতা চালু আছে', blocked: 'ব্রাউজার সেটিংসে বিজ্ঞপ্তির অনুমতি দিন' },
    ta: { title: 'தொலைபேசி எச்சரிக்கைகள்', hint: 'இந்த தொலைபேசியில் முக்கிய வானிலை எச்சரிக்கைகளைப் பெறுங்கள்', enable: 'தொலைபேசி எச்சரிக்கைகளை இயக்கு', enabled: 'தொலைபேசி எச்சரிக்கைகள் இயக்கத்தில் உள்ளன', blocked: 'உலாவி அமைப்புகளில் அறிவிப்புகளை அனுமதிக்கவும்' },
    te: { title: 'ఫోన్ హెచ్చరికలు', hint: 'ఈ ఫోన్‌లో ముఖ్యమైన వాతావరణ హెచ్చరికలను పొందండి', enable: 'ఫోన్ హెచ్చరికలను ప్రారంభించండి', enabled: 'ఫోన్ హెచ్చరికలు ఆన్‌లో ఉన్నాయి', blocked: 'బ్రౌజర్ సెట్టింగ్‌లలో నోటిఫికేషన్‌లను అనుమతించండి' },
    mr: { title: 'फोन सूचना', hint: 'या फोनवर महत्त्वाच्या हवामान सूचना मिळवा', enable: 'फोन सूचना सुरू करा', enabled: 'फोन सूचना सुरू आहेत', blocked: 'ब्राउझर सेटिंगमध्ये सूचनांना परवानगी द्या' },
    gu: { title: 'ફોન ચેતવણીઓ', hint: 'આ ફોન પર મહત્વપૂર્ણ હવામાન ચેતવણીઓ મેળવો', enable: 'ફોન ચેતવણીઓ ચાલુ કરો', enabled: 'ફોન ચેતવણીઓ ચાલુ છે', blocked: 'બ્રાઉઝર સેટિંગમાં સૂચનાઓને મંજૂરી આપો' },
    kn: { title: 'ಫೋನ್ ಎಚ್ಚರಿಕೆಗಳು', hint: 'ಈ ಫೋನ್‌ನಲ್ಲಿ ಪ್ರಮುಖ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪಡೆಯಿರಿ', enable: 'ಫೋನ್ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ', enabled: 'ಫೋನ್ ಎಚ್ಚರಿಕೆಗಳು ಸಕ್ರಿಯವಾಗಿವೆ', blocked: 'ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಅಧಿಸೂಚನೆಗಳನ್ನು ಅನುಮತಿಸಿ' },
    ml: { title: 'ഫോൺ അലേർട്ടുകൾ', hint: 'ഈ ഫോണിൽ പ്രധാന കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ നേടുക', enable: 'ഫോൺ അലേർട്ടുകൾ പ്രവർത്തിപ്പിക്കുക', enabled: 'ഫോൺ അലേർട്ടുകൾ പ്രവർത്തിക്കുന്നു', blocked: 'ബ്രൗസർ ക്രമീകരണങ്ങളിൽ അറിയിപ്പുകൾ അനുവദിക്കുക' },
    pa: { title: 'ਫੋਨ ਚੇਤਾਵਨੀਆਂ', hint: 'ਇਸ ਫੋਨ ਤੇ ਮਹੱਤਵਪੂਰਨ ਮੌਸਮ ਚੇਤਾਵਨੀਆਂ ਲਵੋ', enable: 'ਫੋਨ ਚੇਤਾਵਨੀਆਂ ਚਾਲੂ ਕਰੋ', enabled: 'ਫੋਨ ਚੇਤਾਵਨੀਆਂ ਚਾਲੂ ਹਨ', blocked: 'ਬ੍ਰਾਊਜ਼ਰ ਸੈਟਿੰਗ ਵਿੱਚ ਸੂਚਨਾਵਾਂ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ' },
    ur: { title: 'فون الرٹس', hint: 'اس فون پر اہم موسمی الرٹس حاصل کریں', enable: 'فون الرٹس فعال کریں', enabled: 'فون الرٹس فعال ہیں', blocked: 'براؤزر کی ترتیبات میں اطلاعات کی اجازت دیں' },
    or: { title: 'ଫୋନ୍ ଚେତାବନୀ', hint: 'ଏହି ଫୋନରେ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ପାଣିପାଗ ଚେତାବନୀ ପାଆନ୍ତୁ', enable: 'ଫୋନ୍ ଚେତାବନୀ ଚାଲୁ କରନ୍ତୁ', enabled: 'ଫୋନ୍ ଚେତାବନୀ ଚାଲୁ ଅଛି', blocked: 'ବ୍ରାଉଜର ସେଟିଂରେ ବିଜ୍ଞପ୍ତିକୁ ଅନୁମତି ଦିଅନ୍ତୁ' }
  };

  const phoneText = phoneAlertCopy[language] || phoneAlertCopy.en;

  const farmPlanCopy = {
    en: { title: "Today's Farm Plan", hint: 'Complete important tasks and keep your progress saved', done: 'Done', pending: 'Pending', reset: 'Reset plan' },
    hi: { title: 'आज की खेत योजना', hint: 'जरूरी काम पूरे करें और प्रगति सेव रखें', done: 'पूरा', pending: 'बाकी', reset: 'योजना रीसेट करें' },
    bn: { title: 'আজকের খামার পরিকল্পনা', hint: 'গুরুত্বপূর্ণ কাজ শেষ করুন এবং অগ্রগতি সংরক্ষণ করুন', done: 'সম্পন্ন', pending: 'বাকি', reset: 'পরিকল্পনা রিসেট করুন' },
    ta: { title: 'இன்றைய பண்ணை திட்டம்', hint: 'முக்கிய பணிகளை முடித்து முன்னேற்றத்தை சேமிக்கவும்', done: 'முடிந்தது', pending: 'நிலுவை', reset: 'திட்டத்தை மீட்டமைக்கவும்' },
    te: { title: 'ఈ రోజు సాగు ప్రణాళిక', hint: 'ముఖ్యమైన పనులను పూర్తి చేసి మీ పురోగతిని సేవ్ చేయండి', done: 'పూర్తయింది', pending: 'పెండింగ్', reset: 'ప్రణాళికను రీసెట్ చేయండి' },
    mr: { title: 'आजची शेत योजना', hint: 'महत्त्वाची कामे पूर्ण करा आणि प्रगती जतन करा', done: 'पूर्ण', pending: 'बाकी', reset: 'योजना रीसेट करा' },
    gu: { title: 'આજની ખેતી યોજના', hint: 'મહત્વપૂર્ણ કાર્યો પૂર્ણ કરો અને પ્રગતિ સાચવો', done: 'પૂર્ણ', pending: 'બાકી', reset: 'યોજના રીસેટ કરો' },
    kn: { title: 'ಇಂದಿನ ಕೃಷಿ ಯೋಜನೆ', hint: 'ಪ್ರಮುಖ ಕೆಲಸಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ಉಳಿಸಿ', done: 'ಪೂರ್ಣ', pending: 'ಬಾಕಿ', reset: 'ಯೋಜನೆಯನ್ನು ಮರುಹೊಂದಿಸಿ' },
    ml: { title: 'ഇന്നത്തെ കൃഷി പദ്ധതി', hint: 'പ്രധാന ജോലികൾ പൂർത്തിയാക്കി പുരോഗതി സംരക്ഷിക്കുക', done: 'പൂർത്തിയായി', pending: 'ബാക്കി', reset: 'പദ്ധതി പുനഃക്രമീകരിക്കുക' },
    pa: { title: 'ਅੱਜ ਦੀ ਖੇਤੀ ਯੋਜਨਾ', hint: 'ਜ਼ਰੂਰੀ ਕੰਮ ਪੂਰੇ ਕਰੋ ਅਤੇ ਤਰੱਕੀ ਸੰਭਾਲੋ', done: 'ਪੂਰਾ', pending: 'ਬਾਕੀ', reset: 'ਯੋਜਨਾ ਰੀਸੈਟ ਕਰੋ' },
    ur: { title: 'آج کا کھیت منصوبہ', hint: 'اہم کام مکمل کریں اور پیش رفت محفوظ کریں', done: 'مکمل', pending: 'باقی', reset: 'منصوبہ ری سیٹ کریں' },
    or: { title: 'ଆଜିର ଚାଷ ଯୋଜନା', hint: 'ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ କାମ ସାରନ୍ତୁ ଏବଂ ଅଗ୍ରଗତି ସଞ୍ଚୟ କରନ୍ତୁ', done: 'ସମ୍ପୂର୍ଣ୍ଣ', pending: 'ବାକି', reset: 'ଯୋଜନା ପୁନଃସେଟ୍ କରନ୍ତୁ' }
  };

  const farmPlanText = farmPlanCopy[language] || farmPlanCopy.en;

  const enablePhoneAlerts = async () => {
    if (typeof Notification === 'undefined') return;

    const permission = await Notification.requestPermission();
    const enabled = permission === 'granted';
    setPhoneAlertsEnabled(enabled);
    localStorage.setItem('farmer-phone-alerts', enabled ? 'enabled' : 'disabled');

    if (enabled) {
      new Notification(phoneText.title, { body: phoneText.enabled });
    }
  };

  const translations = {
    en: {
      title: 'My Farm',
      subtitle: 'Weather & Crop Advice for Your Farm',
      preferredLanguage: 'Preferred Language',
      languageHint: 'Choose the language for the dashboard',
      farmName: 'Farm Name',
      location: 'Location',
      area: 'Farm Area',
      soil: 'Soil Type',
      crops: 'My Crops',
      todayWeather: "Today's Weather",
      feelsLike: 'Feels Like',
      humidity: 'Humidity',
      wind: 'Wind Speed',
      soilMoisture: 'Soil Moisture',
      uvIndex: 'UV Index',
      weekForecast: '7-Day Weather Forecast',
      alerts: 'Important Alerts',
      recommendations: 'What To Do',
      yieldPrediction: 'Expected Harvest',
      marketPrices: "Today's Market Prices",
      refresh: 'Refresh',
      good: 'Good',
      excellent: 'Excellent',
      high: 'Urgent',
      medium: 'Important',
      low: 'Info',
      action: 'Action',
      timing: 'When',
      confidence: 'Surety',
      predicted: 'Expected',
      lastYear: 'Last Year',
      perAcre: 'per acre',
      perQuintal: 'per quintal',
      sprayNow: 'Spray Now',
      waterNow: 'Water Now',
      wait: 'Wait',
      sowNow: 'Sow Now',
      harvestNow: 'Harvest Now',
      farmHub: 'Farm Hub',
      notification: 'Notification',
      farmAlerts: 'Farm Alerts',
      live: 'live',
      viewAllAlerts: 'View all alerts',
      allCrops: 'All Crops',
      increase: 'increase',
      all: 'All'
    },
    hi: {
      title: 'मेरा खेत',
      subtitle: 'आपके खेत के लिए मौसम और फसल सलाह',
      preferredLanguage: 'पसंदीदा भाषा',
      languageHint: 'डैशबोर्ड के लिए भाषा चुनें',
      farmName: 'खेत का नाम',
      location: 'स्थान',
      area: 'खेत का क्षेत्र',
      soil: 'मिट्टी का प्रकार',
      crops: 'मेरी फसलें',
      todayWeather: 'आज का मौसम',
      feelsLike: 'महसूस होता है',
      humidity: 'नमी',
      wind: 'हवा की गति',
      soilMoisture: 'मिट्टी की नमी',
      uvIndex: 'UV इंडेक्स',
      weekForecast: '7 दिन का मौसम',
      alerts: 'ज़रूरी सूचनाएं',
      recommendations: 'क्या करें',
      yieldPrediction: 'अनुमानित फसल',
      marketPrices: 'आज के बाजार भाव',
      refresh: 'रीफ्रेश करें',
      good: 'अच्छा',
      excellent: 'बहुत अच्छा',
      high: 'जरूरी',
      medium: 'ध्यान दें',
      low: 'जानकारी',
      action: 'काम',
      timing: 'कब',
      confidence: 'भरोसा',
      predicted: 'अनुमानित',
      lastYear: 'पिछले साल',
      perAcre: 'प्रति एकड़',
      perQuintal: 'प्रति क्विंटल',
      sprayNow: 'अभी छिड़कें',
      waterNow: 'अभी पानी दें',
      wait: 'रुकें',
      sowNow: 'अभी बोएं',
      harvestNow: 'अभी काटें',
      farmHub: 'फार्म हब',
      notification: 'सूचना',
      farmAlerts: 'खेत की चेतावनियाँ',
      live: 'सक्रिय',
      viewAllAlerts: 'सभी अलर्ट देखें',
      allCrops: 'सभी फसलें',
      increase: 'वृद्धि',
      all: 'सभी'
    },
    bn: {
      title: 'আমার খামার',
      subtitle: 'আপনার খামারের জন্য আবহাওয়া ও ফসলের পরামর্শ',
      preferredLanguage: 'পছন্দের ভাষা',
      languageHint: 'ড্যাশবোর্ডের ভাষা বেছে নিন',
      farmName: 'খামারের নাম',
      location: 'স্থান',
      area: 'খামারের ক্ষেত্রফল',
      soil: 'মাটির ধরন',
      crops: 'আমার ফসল',
      todayWeather: 'আজকের আবহাওয়া',
      feelsLike: 'অনুভূতি',
      humidity: 'আর্দ্রতা',
      wind: 'বাতাসের গতি',
      soilMoisture: 'মাটির আর্দ্রতা',
      uvIndex: 'UV সূচক',
      weekForecast: '৭ দিনের আবহাওয়া',
      alerts: 'গুরুত্বপূর্ণ সতর্কতা',
      recommendations: 'কি করবেন',
      yieldPrediction: 'আনুমানিক ফসল',
      marketPrices: 'আজকের বাজার দর',
      refresh: 'রিফ্রেশ',
      good: 'ভালো',
      excellent: 'চমৎকার',
      high: 'জরুরি',
      medium: 'গুরুত্বপূর্ণ',
      low: 'তথ্য',
      action: 'কাজ',
      timing: 'কখন',
      confidence: 'নিশ্চয়তা',
      predicted: 'আনুমানিক',
      lastYear: 'গত বছর',
      perAcre: 'প্রতি একরে',
      perQuintal: 'প্রতি কুইন্টালে',
      sprayNow: 'এখন স্প্রে করুন',
      waterNow: 'এখন পানি দিন',
      wait: 'থামুন',
      sowNow: 'এখন বপন করুন',
      harvestNow: 'এখন কাটা শুরু করুন',
      farmHub: 'ফার্ম হাব',
      notification: 'নোটিফিকেশন',
      farmAlerts: 'খামারের সতর্কতা',
      live: 'সক্রিয়',
      viewAllAlerts: 'সব সতর্কতা দেখুন',
      allCrops: 'সব ফসল',
      increase: 'বৃদ্ধি',
      all: 'সব'
    },
    ta: {
      title: 'என் பண்ணை',
      subtitle: 'உங்கள் பண்ணைக்கான வானிலை மற்றும் பயிர் ஆலோசனை',
      preferredLanguage: 'விருப்ப மொழி',
      languageHint: 'டாஷ்போர்டுக்கான மொழியை தேர்ந்தெடுக்கவும்',
      farmName: 'பண்ணையின் பெயர்',
      location: 'இடம்',
      area: 'பண்ணை பரப்பு',
      soil: 'மண் வகை',
      crops: 'என் பயிர்கள்',
      todayWeather: 'இன்றைய வானிலை',
      feelsLike: 'வெப்ப உணர்வு',
      humidity: 'ஈரப்பதம்',
      wind: 'காற்றின் வேகம்',
      soilMoisture: 'மண் ஈரப்பதம்',
      uvIndex: 'UV குறியீடு',
      weekForecast: '7 நாள் வானிலை',
      alerts: 'முக்கிய எச்சரிக்கைகள்',
      recommendations: 'என்ன செய்வது',
      yieldPrediction: 'எதிர்பார்க்கப்படும் அறுவடை',
      marketPrices: 'இன்றைய சந்தை விலை',
      refresh: 'புதுப்பி',
      good: 'சரி',
      excellent: 'மிகவும் நல்லது',
      high: 'அவசரம்',
      medium: 'முக்கியம்',
      low: 'தகவல்',
      action: 'செயல்',
      timing: 'எப்போது',
      confidence: 'நிச்சயம்',
      predicted: 'எதிர்பார்க்கப்பட்டது',
      lastYear: 'கடந்த ஆண்டு',
      perAcre: 'ஒரு ஏக்கருக்கு',
      perQuintal: 'ஒரு குவின்டாலுக்கு',
      sprayNow: 'இப்போதே தெளிக்கவும்',
      waterNow: 'இப்போதே நீர் பாய்ச்சவும்',
      wait: 'காத்திருங்கள்',
      sowNow: 'இப்போதே விதைக்கவும்',
      harvestNow: 'இப்போதே அறுவடை செய்யவும்',
      farmHub: 'பண்ணை ஹப்',
      notification: 'அறிவிப்பு',
      farmAlerts: 'பண்ணை எச்சரிக்கைகள்',
      live: 'நிகழ்',
      viewAllAlerts: 'அனைத்து எச்சரிக்கைகளையும் காண்க',
      allCrops: 'அனைத்து பயிர்கள்',
      increase: 'வளர்ச்சி',
      all: 'அனைத்தும்'
    },
    te: {
      title: 'నా సాగు',
      subtitle: 'మీ సాగుకు వాతావరణ మరియు పంట సలహా',
      preferredLanguage: 'ఇష్టమైన భాష',
      languageHint: 'డాష్‌బోర్డ్‌కి భాషను ఎంచుకోండి',
      farmName: 'సాగు పేరు',
      location: 'స్థానం',
      area: 'సాగు విస్తీర్ణం',
      soil: 'మట్టির రకం',
      crops: 'నా పంటలు',
      todayWeather: 'ఈ రోజు వాతావరణం',
      feelsLike: 'అనుభూతి',
      humidity: 'తేమ',
      wind: 'గాలి వేగం',
      soilMoisture: 'మట్టి తేమ',
      uvIndex: 'UV సూచిక',
      weekForecast: '7 రోజుల వాతావరణం',
      alerts: 'ముఖ్య హెచ్చరికలు',
      recommendations: 'ఏం చేయాలి',
      yieldPrediction: 'అంచనా దిగుబడి',
      marketPrices: 'ఈ రోజు మార్కెట్ ధరలు',
      refresh: 'రిఫ్రెష్',
      good: 'బాగుంది',
      excellent: 'అత్యంత మంచి',
      high: 'అత్యవసరం',
      medium: 'ముఖ్యమైనది',
      low: 'సమాచారం',
      action: 'చర్య',
      timing: 'ఎప్పుడు',
      confidence: 'నమ్మకం',
      predicted: 'అంచనా',
      lastYear: 'గత సంవత్సరం',
      perAcre: 'ప్రతి ఎకరానికి',
      perQuintal: 'ప్రతి క్వింటാളుకు',
      sprayNow: 'ఇప్పుడే స్ప్రే చేయండి',
      waterNow: 'ఇప్పుడే నీరు చల్లండి',
      wait: 'ఆగండి',
      sowNow: 'ఇప్పుడే విత్తనం వేయండి',
      harvestNow: 'ఇప్పుడే పంట కోయండి'
    },
    mr: {
      title: 'माझे शेत',
      subtitle: 'तुमच्या शेतासाठी हवामान आणि पिकांची सूचना',
      preferredLanguage: 'पसंतीची भाषा',
      languageHint: 'डॅशबोर्डसाठी भाषा निवडा',
      farmName: 'शेत नाव',
      location: 'स्थान',
      area: 'शेत क्षेत्र',
      soil: 'मातीचा प्रकार',
      crops: 'माझ्या पिकांना',
      todayWeather: 'आजचे हवामान',
      feelsLike: 'जणू वाटते',
      humidity: 'आर्द्रता',
      wind: 'वाऱ्याचा वेग',
      soilMoisture: 'मातीची ओल',
      uvIndex: 'UV निर्देशांक',
      weekForecast: '७ दिवसांचे हवामान',
      alerts: 'महत्वाची सूचना',
      recommendations: 'काय करावे',
      yieldPrediction: 'अंदाजे उत्पादन',
      marketPrices: 'आजचा बाजारभाव',
      refresh: 'रिफ्रेश',
      good: 'चांगले',
      excellent: 'अतिशय चांगले',
      high: 'तातडीचे',
      medium: 'महत्वाचे',
      low: 'माहिती',
      action: 'कृती',
      timing: 'केव्हा',
      confidence: 'विश्वास',
      predicted: 'अंदाज',
      lastYear: 'गेलेल्या वर्षी',
      perAcre: 'प्रति एकर',
      perQuintal: 'प्रति क्विंटल',
      sprayNow: 'आता फवारणी करा',
      waterNow: 'आता पाणी द्या',
      wait: 'थांबा',
      sowNow: 'आता बी बिया पेरा',
      harvestNow: 'आता कापणी करा',
      farmHub: 'फार्म हब',
      notification: 'सूचना',
      farmAlerts: 'शेताची सूचना',
      live: 'लाइव्ह',
      viewAllAlerts: 'सर्व सूचना पाहा',
      allCrops: 'सर्व पीक',
      increase: 'वाढ',
      all: 'सर्व'
    },
    gu: {
      title: 'મારું ખેતર',
      subtitle: 'તમારા ખેતર માટે હવામાન અને પાકની સલાહ',
      preferredLanguage: 'પસંદીदा ભાષા',
      languageHint: 'ડૅશબોર્ડ માટે ભાષા પસંદ કરો',
      farmName: 'ખેતરની નામ',
      location: 'સ્થાન',
      area: 'ખેતરનું ક્ષેત્રફળ',
      soil: 'માટીનો પ્રકાર',
      crops: 'મારા પાક',
      todayWeather: 'આજનું હવામાન',
      feelsLike: 'લગે છે',
      humidity: 'આર્દ્રતા',
      wind: 'હવાના વેગ',
      soilMoisture: 'માટીનું પાણી',
      uvIndex: 'UV ઈન્ડેક્સ',
      weekForecast: '૭ દિવસનું હવામાન',
      alerts: 'મહત્વપૂર્ણ ચેતવણીઓ',
      recommendations: 'શું કરવું',
      yieldPrediction: 'આનુમાનિત ઉપજ',
      marketPrices: 'આજનો બજાર ભાવ',
      refresh: 'રિફ્રેશ',
      good: 'સારો',
      excellent: 'બહુ સારું',
      high: 'જ々રूरी',
      medium: 'મહત્વપૂર્ણ',
      low: 'માહિતી',
      action: 'ક્રિયા',
      timing: 'ક્યારે',
      confidence: 'વિશ્વાસ',
      predicted: 'આનુમાનિત',
      lastYear: 'ગયા વર્ષે',
      perAcre: 'પ્રતિ એકર',
      perQuintal: 'પ્રતિ ક્વિન્ટલ',
      sprayNow: 'હવે સ્પ્રે કરો',
      waterNow: 'હવે પાણી આપી',
      wait: 'રાહોઓ',
      sowNow: 'હવે બીજ વાવોઆ',
      harvestNow: 'હવે ફসল કાપો',
      farmHub: 'ફાર્મ હબ',
      notification: 'નોટિફિકેશન',
      farmAlerts: 'ખેતરની ચેતવણીઓ',
      live: 'લાઈવ',
      viewAllAlerts: 'બધી ચેતવણીઓ જુઓ',
      allCrops: 'બધા પાક',
      increase: 'વૃદ્ધિ',
      all: 'બધા'
    },
    kn: {
      title: 'ನನ್ನ ಹೊಲ',
      subtitle: 'ನಿಮ್ಮ ಹೊಲದ 날 weather ಮತ್ತು ದ.sensor ಸಲಹೆಗಳು',
      preferredLanguage: 'ಪ್ರಿಯ ಭಾಷೆ',
      languageHint: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ಗೆ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
      farmName: 'ಹೊಲದ ಹೆಸರು',
      location: 'ಸ್ಥಳ',
      area: 'ಹೊಲದ ಪ್ರದೇಶ',
      soil: 'ಮಣ್ಣಿನ ಪ್ರಕಾರ',
      crops: 'ನನ್ನ ಬೆಳೆಗಳು',
      todayWeather: 'ಇಂದಿನ ಹವಾಮಾನ',
      feelsLike: 'ಅನಿಸಿಕೆ',
      humidity: 'ಆವಿಯಾದತೆ',
      wind: 'ಗಾಳಿ ವೇಗ',
      soilMoisture: 'ಮಣ್ಣಿನ ತೇವ',
      uvIndex: 'UV ಸೂಚಿ',
      weekForecast: '7 ದಿನಗಳ ಹವಾಮಾನ',
      alerts: 'ಪ್ರಮುಖ ಸೂಚನೆಗಳು',
      recommendations: 'ಏನು ಮಾಡಬೇಕು',
      yieldPrediction: 'ಅಂದಾಜು ಧಾನ್ಯ',
      marketPrices: 'ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ',
      refresh: 'ರಿಫ್ರೆಶ್',
      good: 'ಒಳ್ಳೆಯದು',
      excellent: 'ಅತ್ಯುತ್ತಮ',
      high: 'ತುರ್ತು',
      medium: 'ಪ್ರಮುಖ',
      low: 'ಮಾಹಿತಿ',
      action: 'ಕ್ರಿಯೆ',
      timing: 'ಎಲ್ಲಿ',
      confidence: 'ನಂಬಿಕೆ',
      predicted: 'ಅಂದಾಜು',
      lastYear: '지난 ವರ್ಷ',
      perAcre: 'ಪ್ರತಿ ಎಕರೆಗೆ',
      perQuintal: 'ಪ್ರತಿ ಕ್ವಿಂಟಲ್ಗೆ',
      sprayNow: 'ಈಗ ಸ್ಪ್ರೇ ಮಾಡಿ',
      waterNow: 'ಈಗ ನೀರು ಕೊಡಿ',
      wait: 'ನಿಲ್ಲಿ',
      sowNow: 'ಈಗ ಬಿತ್ತಿ ಮಾಡಿ',
      harvestNow: 'ಈಗ ಸುಗ್ಗಿ ಮಾಡಿ',
      farmHub: 'ಫಾರ್ಮ್ ಹಬ್',
      notification: 'ಅಧಿಸೂಚನೆ',
      farmAlerts: 'ಹೊಲದ ಎಚ್ಚರಿಕೆಗಳು',
      live: 'ಲೈವ್',
      viewAllAlerts: 'ಎಲ್ಲಾ ಎಚ್ಚರಿಕೆಗಳನ್ನು ನೋಡಿ',
      allCrops: 'ಎಲ್ಲಾ വിളಗಳು',
      increase: 'ವೃದ್ಧಿ',
      all: 'ಎಲ್ಲವೂ'
    },
    ml: {
      title: 'എന്റെ ഫാം',
      subtitle: 'നിങ്ങളുടെ പറമ്പിനുള്ള കാലാവസ്ഥയും വിള പരാമർശവും',
      preferredLanguage: 'ഊന്നിയ ഭാഷ',
      languageHint: 'ഡാഷ്ബോർഡിനായി ഭാഷ തിരഞ്ഞെടുക്കുക',
      farmName: 'ഫാമിന്റെ പേര്',
      location: 'സ്ഥലം',
      area: 'ഫാമിന്റെ വിസ്തൃതി',
      soil: 'മണ്ണിന്റെ തരം',
      crops: 'എന്റെ വിളകൾ',
      todayWeather: 'ഇന്നത്തെ കാലാവസ്ഥ',
      feelsLike: 'എങ്ങനെ തോന്നുന്നു',
      humidity: 'ആര്ദ്രത',
      wind: 'കാറ്റിന്റെ വേഗം',
      soilMoisture: 'മണ്ണിന്റെ തണ്ണീര്',
      uvIndex: 'UV സൂചകം',
      weekForecast: '7 ദിവസത്തെ കാലാവസ്ഥ',
      alerts: 'പ്രധാന ജാഗ്രതകൾ',
      recommendations: 'എന്തുചെയ്യണം',
      yieldPrediction: 'അനുമാനിച്ച വിളവ്',
      marketPrices: 'ഇന്നത്തെ വിപണി വില',
      refresh: 'പുതുക്കുക',
      good: 'ശരിയാണ്',
      excellent: 'വളരെ നല്ലത്',
      high: 'അടിയന്തിരം',
      medium: 'പ്രാധാന്യം',
      low: 'വിവരം',
      action: 'നടപടി',
      timing: 'എപ്പോഴാണ്',
      confidence: 'വിശ്വാസം',
      predicted: 'അനുമാനിച്ചു',
      lastYear: 'കഴിഞ്ഞ വർഷം',
      perAcre: 'ഒരു എക്കറിന്',
      perQuintal: 'ഒരു ക്വിന്റാളിന്',
      sprayNow: 'ഇപ്പൊ തന്നെ സ്പ്രേ ചെയ്യുക',
      waterNow: 'ഇപ്പൊ തന്നെ തേച്ചുക',
      wait: 'കാത്തിരിക്കൂ',
      sowNow: 'ഇപ്പൊ തന്നെ വിതയ്ക്കുക',
      harvestNow: 'ഇപ്പൊ തന്നെ കൊയ്തെടുക്കുക',
      farmHub: 'ഫാർം ഹബ്',
      notification: 'അറിയിപ്പ്',
      farmAlerts: 'കൃഷിഭൂമിയിലെ അലേർട്ടുകൾ',
      live: 'ലിവ്',
      viewAllAlerts: 'എല്ലാ അലേർട്ടുകളും കാണുക',
      allCrops: 'എല്ലാ വിളകളും',
      increase: 'വർദ്ധനം',
      all: 'എല്ലാം'
    },
    pa: {
      title: 'ਮੇਰਾ ਖੇਤ',
      subtitle: 'ਤੁਹਾਡੇ ਖੇਤ ਲਈ ਮੌਸਮ ਅਤੇ ਫਸਲ ਦੀ ਸਲਾਹ',
      preferredLanguage: 'ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ',
      languageHint: 'ਡੈਸ਼ਬੋਰਡ ਲਈ ਭਾਸ਼ਾ ਚੁਣੋ',
      farmName: 'ਖੇਤ ਦਾ ਨਾਂ',
      location: 'ਸਥਾਨ',
      area: 'ਖੇਤ ਦਾ ਖੇਤਰ',
      soil: 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ',
      crops: 'ਮੇਰੀ ਫਸਲਾਂ',
      todayWeather: 'ਅੱਜ ਮੌਸਮ',
      feelsLike: 'ਲਗਦਾ ਹੈ',
      humidity: 'ਨਮੀ',
      wind: 'ਹਵਾ ਦੀ ਗਤੀ',
      soilMoisture: 'ਮਿੱਟੀ ਦੀ ਨਮੀ',
      uvIndex: 'UV ਇੰਡੈਕਸ',
      weekForecast: '7 ਦਿਨਾਂ ਦਾ ਮੌਸਮ',
      alerts: 'ਮਹੱਤਵਪੂਰਨ ਚੇਤਾਵਨੀ',
      recommendations: 'ਕੀ ਕਰਨਾ ਹੈ',
      yieldPrediction: 'ਅਨੁਮਾਨਿਤ ਫਸਲ',
      marketPrices: 'ਅੱਜ ਦੇ ਬਾਜ਼ਾਰ ਭਾਅ',
      refresh: 'ਰਿਫਰੈਸ਼',
      good: 'ਚੰਗਾ',
      excellent: 'ਬਹੁਤ ਵਧੀਆ',
      high: 'ਤੁਰੰਤ',
      medium: 'ਮਹੱਤਵਪੂਰਨ',
      low: 'ਜਾਣਕਾਰੀ',
      action: 'ਕੰਮ',
      timing: 'ਕਦੋਂ',
      confidence: 'ਭਰੋਸਾ',
      predicted: 'ਅਨੁਮਾਨ',
      lastYear: 'ਪਿਛਲੇ ਸਾਲ',
      perAcre: 'ਪ੍ਰਤੀ ਏਕਰ',
      perQuintal: 'ਪ੍ਰਤੀ ਕੁਇੰਟਲ',
      sprayNow: 'ਹੁਣੇ ਸਪਰੇ ਕਰੋ',
      waterNow: 'ਹੁਣੇ ਪਾਣੀ ਦਿਓ',
      wait: 'ਰੁਕੋ',
      sowNow: 'ਹੁਣੇ ਬੀਜ ਬੋਵੋ',
      harvestNow: 'ਹੁਣੇ ਫਸਲ ਕੱਟੋ',
      farmHub: 'ਫਾਰਮ ਹਬ',
      notification: 'ਨੋਟੀਫਿਕੇਸ਼ਨ',
      farmAlerts: 'ਖੇਤ ਦੀ ਚੇਤਾਵਨੀ',
      live: 'ਲਾਈਵ',
      viewAllAlerts: 'ਸਭ ਚੇਤਾਵਨੀਆਂ ਦੇਖੋ',
      allCrops: 'ਸਭ ਫਸਲਾਂ',
      increase: 'ਵਾਧਾ',
      all: 'ਸਭ'
    },
    ur: {
      title: 'میرا کھیت',
      subtitle: 'آپ کے کھیت کے لیے موسمی حالات اور فصل کا مشورہ',
      preferredLanguage: 'پسندیدہ زبان',
      languageHint: 'ڈیش بورڈ کے لیے زبان منتخب کریں',
      farmName: 'کھیت کا نام',
      location: 'مقام',
      area: 'کھیت کا رقبہ',
      soil: 'مٹی کی قسم',
      crops: 'میری فصلیں',
      todayWeather: 'آج کا موسم',
      feelsLike: 'محسوس ہوتا ہے',
      humidity: 'نمی',
      wind: 'ہوا کی رفتار',
      soilMoisture: 'مٹی کی نمی',
      uvIndex: 'UV انڈیکس',
      weekForecast: '7 دن کا موسم',
      alerts: 'اہم الرٹ',
      recommendations: 'کیا کرنا ہے',
      yieldPrediction: 'تخمینی پیداوار',
      marketPrices: 'آج کے مارکیٹ دام',
      refresh: 'ریفریش',
      good: 'اچھا',
      excellent: 'بہت اچھا',
      high: 'فوری',
      medium: 'اہم',
      low: 'معلومات',
      action: 'عمل',
      timing: 'کب',
      confidence: 'اعتماد',
      predicted: 'تخمینہ',
      lastYear: 'گزشتہ سال',
      perAcre: 'فی ایکڑ',
      perQuintal: 'فی کوئنٹل',
      sprayNow: 'ابھی اسپرے کریں',
      waterNow: 'ابھی پانی دیں',
      wait: 'رکیں',
      sowNow: 'ابھی بیج بوئیں',
      harvestNow: 'ابھی فصل کٹائیں',
      farmHub: 'فارم ہب',
      notification: 'نوٹیفکیشن',
      farmAlerts: 'کھیت کی الرٹس',
      live: 'لائیو',
      viewAllAlerts: 'تمام الرٹس دیکھیں',
      allCrops: 'تمام فصلیں',
      increase: 'اضافہ',
      all: 'سب'
    },
    or: {
      title: 'ମୋ ଫସଲୀ',
      subtitle: 'ଆପଣଙ୍କ ଫସଲ ପାଇଁ ଆବହାବା ଓ ସୁପାରିଶ',
      preferredLanguage: 'ପସନ୍ଦର ଭାଷା',
      languageHint: 'ଡ୍ୟାଶବୋର୍ଡ ପାଇଁ ଭାଷା ଚୟନ କରନ୍ତୁ',
      farmName: 'ଫାର୍ମର ନାମ',
      location: 'ସ୍ଥାନ',
      area: 'ଫାର୍ମର ଆୟତନ',
      soil: 'ମୃତ୍ତିକା ପ୍ରକାର',
      crops: 'ମୋ ଫସଲ',
      todayWeather: 'ଆଜିର ଆବାହାବା',
      feelsLike: 'ଲାଗେ',
      humidity: 'ଆର୍ଦ୍ରତା',
      wind: 'ହାବାର ବେଗ',
      soilMoisture: 'ମୃତ୍ତିକାର ଆର୍ଦ୍ରତା',
      uvIndex: 'UV ଇଣ୍ଡେକ୍ସ',
      weekForecast: '7 ଦିନର ଆବାହାବା',
      alerts: 'ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ଚେତାବନୀ',
      recommendations: 'କ’ଣ କରିବା',
      yieldPrediction: 'ଅନୁମାନିତ ଫଳନ',
      marketPrices: 'ଆଜିର ବଜାର ଦର',
      refresh: 'ରିଫ୍ରେଶ',
      good: 'ଭଲ',
      excellent: 'ଅତିଭଲ',
      high: 'ଜରୁରୀ',
      medium: 'ମହତ୍ୱପୂର୍ଣ୍ଣ',
      low: 'ସୂଚନା',
      action: 'କାର୍ଯ୍ୟ',
      timing: 'କେବେ',
      confidence: 'ନିଶ୍ଚୟତା',
      predicted: 'ଅନୁମାନ',
      lastYear: 'ଗତ ବର୍ଷ',
      perAcre: 'ପ୍ରତି ଏକର',
      perQuintal: 'ପ୍ରତି କ୍ୱିଣ୍ଟାଲ୍',
      sprayNow: 'ବର୍ତ୍ତମାନ ସ୍ପ୍ରେ କରନ୍ତୁ',
      waterNow: 'ବର୍ତ୍ତମାନ ପାଣି ଦିଅନ୍ତୁ',
      wait: 'ଥିରି ରୁହନ୍ତୁ',
      sowNow: 'ବର୍ତ୍ତମାନ ବୀଜ ବୁଣନ୍ତୁ',
      harvestNow: 'ବର୍ତ୍ତମାନ ଫସଲ କଟନ୍ତୁ',
      farmHub: 'ଫାର୍ମ ହବ',
      notification: 'ଅଧିସୂଚନା',
      farmAlerts: 'ଫସଲର ଚେତାବନୀ',
      live: 'ଲାଇଭ୍',
      viewAllAlerts: 'ସମସ୍ତ ଚେତାବନୀ ଦେଖନ୍ତୁ',
      allCrops: 'ସମସ୍ତ ଫସଲ',
      increase: 'ବୃଦ୍ଧି',
      all: 'ସମସ୍ତ'
    }
  };

  const t = { ...translations.en, ...(translations[language] || {}) };

  const farmerNames = {
    en: 'Ramesh Patil',
    hi: 'रमेश पाटिल',
    bn: 'রমেশ পাটিল',
    ta: 'ரமேஷ் பாட்டீல்',
    te: 'రమేష్ పాటిల్',
    mr: 'रमेश पाटील',
    gu: 'રમેશ પાટીલ',
    kn: 'ರಮೇಶ್ ಪಾಟೀಲ್',
    ml: 'രമേഷ് പാട്ടീൽ',
    pa: 'ਰਮੇਸ਼ ਪਾਟਿਲ',
    ur: 'رمیش پاٹل',
    or: 'ରମେଶ ପାଟିଲ'
  };

  const getLocalizedFarmerName = () => farmerNames[language] || farmerNames.en;

  const normalizeCropKey = (crop) => String(crop || '').trim().toLowerCase();

  const weatherConditions = {
    Sunny: { en: 'Sunny', hi: 'धूप', bn: 'রোদ', ta: 'சூரியன்', te: 'సూర్యుడు', mr: 'सूर्यप्रकाश', gu: 'સૂર્યપ્રકાશ', kn: 'ಸೂರ್ಯ', ml: 'സൂര്യൻ', pa: 'ਸੂਰਜ', ur: 'سورج', or: 'ସୂର୍ଯ୍ୟ' },
    'Partly Cloudy': { en: 'Partly Cloudy', hi: 'आंशिक बादल', bn: 'আংশিক মেঘলা', ta: 'சில பகுதிகள் மேகமூட்டம்', te: 'పాక్షిక మేఘావృతం', mr: 'अंशतः ढगाळ', gu: 'આંશિક після', kn: 'ಭಾಗಶಃ ಮೋಡದ', ml: 'ഭാഗികമായി മേഘാവൃതം', pa: 'ਕੁਝ ਬੱਦਲ', ur: 'جزوی طور پر ابرآلود', or: 'ଆଞ୍ଚଳିକ ମେଘଲ' },
    Cloudy: { en: 'Cloudy', hi: 'बादल', bn: 'মেঘলা', ta: 'மேகமூட்டம்', te: 'మేఘావృతం', mr: 'ढगाळ', gu: 'મેઘાળું', kn: 'ಮೋಡದ', ml: 'മേഘാവൃതം', pa: 'ਬਦਲ', ur: 'ابرآلود', or: 'ମେଘଲ' },
    'Light Rain': { en: 'Light Rain', hi: 'हल्की बारिश', bn: 'হালকা বৃষ্টি', ta: 'லேசான மழை', te: 'తేలికపాటి వర్షం', mr: 'हलका पाऊस', gu: 'હળવો વરસાદ', kn: 'ಸುಕ್ಷ್ಮ ಮಳೆ', ml: 'തീവ്രമല്ലാത്ത മഴ', pa: 'ਹਲਕਾ ਬਾਰਸ਼', ur: 'ہلکی بارش', or: 'ହାଳକି ବର୍ଷା' },
    'Heavy Rain': { en: 'Heavy Rain', hi: 'तेज़ बारिश', bn: 'ভারী বৃষ্টি', ta: 'கடுமையான மழை', te: 'తీవ్రమైన వర్షం', mr: 'जोरदार पाऊस', gu: 'ભારે વરસાદ', kn: 'ಭಾರಿ ಮಳೆ', ml: 'കടുത്ത മഴ', pa: 'ਭਾਰੀ ਬਰਿਸ਼ਤ', ur: 'شدید بارش', or: 'ତୀବ୍ର ବର୍ଷା' }
  };

  const translateWeatherCondition = (condition) => weatherConditions[condition]?.[language] || condition;

  const timingLabels = {
    'Next 3 days': { en: 'Next 3 days', hi: 'अगले 3 दिन', bn: 'পরবর্তী ৩ দিন', ta: 'அடுத்த 3 நாட்கள்', te: 'తదుపరి 3 రోజులు', mr: 'पुढील 3 दिवस', gu: 'આગામી 3 દિવસ', kn: 'ಮುಂದಿನ 3 ದಿನಗಳು', ml: 'അടുത്ത 3 ദിവസങ്ങൾ', pa: 'ਅਗਲੇ 3 ਦਿਨ', ur: 'اگلے 3 دن', or: 'ଆସନ୍ତା 3 ଦିନ' },
    'Next 5-7 days': { en: 'Next 5-7 days', hi: 'अगले 5-7 दिन', bn: 'পরবর্তী ৫-৭ দিন', ta: 'அடுத்த 5-7 நாட்கள்', te: 'తదుపరి 5-7 రోజులు', mr: 'पुढील 5-7 दिवस', gu: 'આગામી 5-7 દિવસ', kn: 'ಮುಂದಿನ 5-7 ದಿನಗಳು', ml: 'അടുത്ത 5-7 ദിവസങ്ങൾ', pa: 'ਅਗਲੇ 5-7 ਦਿਨ', ur: 'اگلے 5-7 دن', or: 'ଆସନ୍ତା 5-7 ଦିନ' },
    Today: { en: 'Today', hi: 'आज', bn: 'আজ', ta: 'இன்று', te: 'ఈ రోజు', mr: 'आज', gu: 'આજે', kn: 'ಇಂದು', ml: 'ഇന്ന്', pa: 'ਅੱਜ', ur: 'آج', or: 'ଆଜି' }
  };

  const translateTiming = (timing) => timingLabels[timing]?.[language] || timing;

  const unitLabels = {
    en: { acre: 'acre', acres: 'acres', ton: 'ton', tons: 'tons', quintal: 'per quintal' },
    hi: { acre: 'एकड़', acres: 'एकड़', ton: 'टन', tons: 'टन', quintal: 'प्रति क्विंटल' },
    bn: { acre: 'একর', acres: 'একর', ton: 'টন', tons: 'টন', quintal: 'প্রতি কুইন্টাল' },
    ta: { acre: 'ஏக்கர்', acres: 'ஏக்கர்', ton: 'டன்', tons: 'டன்', quintal: 'ஒரு குவின்டாலுக்கு' },
    te: { acre: 'ఎకరం', acres: 'ఎకరాలు', ton: 'టన్ను', tons: 'టన్నులు', quintal: 'ప్రతి క్వింటాలుకు' },
    mr: { acre: 'एकर', acres: 'एकर', ton: 'टन', tons: 'टन', quintal: 'प्रति क्विंटल' },
    gu: { acre: 'એકર', acres: 'એકર', ton: 'ટન', tons: 'ટન', quintal: 'પ્રતિ ક્વિન્ટલ' },
    kn: { acre: 'ಎಕರೆ', acres: 'ಎಕರೆ', ton: 'ಟನ್', tons: 'ಟನ್', quintal: 'ಪ್ರತಿ ಕ್ವಿಂಟಲ್' },
    ml: { acre: 'ഏക്കർ', acres: 'ഏക്കർ', ton: 'ടൺ', tons: 'ടൺ', quintal: 'ഒരു ക്വിന്റലിന്' },
    pa: { acre: 'ਏਕੜ', acres: 'ਏਕੜ', ton: 'ਟਨ', tons: 'ਟਨ', quintal: 'ਪ੍ਰਤੀ ਕੁਇੰਟਲ' },
    ur: { acre: 'ایکڑ', acres: 'ایکڑ', ton: 'ٹن', tons: 'ٹن', quintal: 'فی کوئنٹل' },
    or: { acre: 'ଏକର', acres: 'ଏକର', ton: 'ଟନ', tons: 'ଟନ', quintal: 'ପ୍ରତି କ୍ୱିଣ୍ଟାଲ' }
  };

  const units = unitLabels[language] || unitLabels.en;

  const cropNames = {
    en: { wheat: 'Wheat', sugarcane: 'Sugarcane', cotton: 'Cotton' },
    hi: { wheat: 'गेहूँ', sugarcane: 'गन्ना', cotton: 'कपास' },
    bn: { wheat: 'গম', sugarcane: 'আখ', cotton: 'কাপাস' },
    ta: { wheat: 'கோதுமை', sugarcane: 'கரும்பு', cotton: 'பருத்தி' },
    te: { wheat: 'గోధుమ', sugarcane: 'చెరకు', cotton: 'పత్తి' },
    mr: { wheat: 'गहू', sugarcane: 'ऊस', cotton: 'कापूस' },
    gu: { wheat: 'ગहुँ', sugarcane: 'ખાધ', cotton: 'કપાસ' },
    kn: { wheat: 'ಗೋಧಿ', sugarcane: 'ಕಬ್ಬು', cotton: 'ಹತ್ತಿ' },
    ml: { wheat: 'ഗോതമ്പ്', sugarcane: 'ചൂര', cotton: 'പട്ട്' },
    pa: { wheat: 'ਗੰਨ', sugarcane: 'ਗੰਨਾ', cotton: 'ਕਪਾਹ' },
    ur: { wheat: 'گندم', sugarcane: 'گنا', cotton: 'کپاس' },
    or: { wheat: 'ଗହମ', sugarcane: 'ଆକ', cotton: 'କପାସ' }
  };

  const formatNumber = (value) => {
    const locale = localeMap[language] || 'en-IN';
    return new Intl.NumberFormat(locale).format(Number(value || 0));
  };

  const formatArea = (value) => {
    const amount = String(value || '').match(/[\d.]+/)?.[0] || '0';
    return `${formatNumber(amount)} ${Number(amount) === 1 ? units.acre : units.acres}`;
  };

  const formatYield = (value) => {
    const amount = String(value || '').match(/[\d.]+/)?.[0] || '0';
    return `${formatNumber(amount)} ${Number(amount) === 1 ? units.ton : units.tons}/${units.acre}`;
  };

  const getLocalizedCropName = (crop) => {
    const key = normalizeCropKey(crop);
    return cropNames[language]?.[key] || crop;
  };

  const translateAlertAction = (type) => {
   const actions = {
  Sowing: {
    en: 'Sowing',
    hi: 'बोना',
    bn: 'বপন',
    ta: 'விதைப்பு',
    te: 'విత్తనం',
    mr: 'बियाणे',
    gu: 'બિયારણ',
    kn: 'ಬಿತ್ತನೆ',
    ml: 'വിതയ്ക്കൽ',
    pa: 'ਬੀਜ ਬੋਣਾ',
    ur: 'بیج ڈالنا',
    or: 'ବୀଜ ବୁଣନ୍ତୁ'
  },

  Harvesting: {
    en: 'Harvesting',
    hi: 'कटाई',
    bn: 'ফসল তোলা',
    ta: 'பயிர் அறுவடை',
    te: 'పంట కోత',
    mr: 'कापणी',
    gu: 'ફસ્લ કાપણી',
    kn: 'ಸುಗ್ಗಿ',
    ml: 'കൊയ്തുയരിക്കൽ',
    pa: 'ਫਸਲ ਕੱਟਣਾ',
    ur: 'فصل کٹانا',
    or: 'ଫସଲ କାଟନ୍ତୁ'
  },

  Irrigation: {
    en: 'Irrigation',
    hi: 'सिंचाई',
    bn: 'সেচ',
    ta: 'நீர்ப்பாசனம்',
    te: 'నీటి పంట',
    mr: 'सिंचन',
    gu: 'સિંચાઈ',
    kn: 'ನೀರಾವರಿ',
    ml: 'ജലസേചനം',
    pa: 'ਸਿੰਚਾਈ',
    ur: 'سائٹ',
    or: 'ସିଚନ'
  },

  Drainage: {
    en: 'Drainage',
    hi: 'जल निकासी',
    bn: 'নিষ্কাশন',
    ta: 'வடிகால்',
    te: 'డ్రైనేజ్',
    mr: 'निचरा',
    gu: 'ડ્રેનેજ',
    kn: 'ಒಳಚರಂಡಿ',
    ml: 'ഡ്രെയിനേജ്',
    pa: 'ਨਿਕਾਸੀ',
    ur: 'نکاسی آب',
    or: 'ନିଷ୍କାସନ'
  },

  Monitoring: {
    en: 'Monitoring',
    hi: 'निगरानी',
    bn: 'পর্যবেক্ষণ',
    ta: 'கண்காணிப்பு',
    te: 'పర్యవేక్షణ',
    mr: 'निगराणी',
    gu: 'નિરીક્ષણ',
    kn: 'ಮೇಲ್ವಿಚಾರಣೆ',
    ml: 'നിരീക്ഷണം',
    pa: 'ਨਿਗਰਾਨੀ',
    ur: 'نگرانی',
    or: 'ନିରୀକ୍ଷଣ'
  },

  'Disease Monitoring': {
    en: 'Disease Monitoring',
    hi: 'रोग निगरानी',
    bn: 'রোগ পর্যবেক্ষণ',
    ta: 'நோய் கண்காணிப்பு',
    te: 'వ్యాధి పర్యవేక్షణ',
    mr: 'रोग निरीक्षण',
    gu: 'રોગ નિરીક્ષણ',
    kn: 'ರೋಗ ಮೇಲ್ವಿಚಾರಣೆ',
    ml: 'രോഗ നിരീക്ഷണം',
    pa: 'ਰੋਗ ਨਿਗਰਾਨੀ',
    ur: 'بیماری کی نگرانی',
    or: 'ରୋଗ ନିରୀକ୍ଷଣ'
  }
};

    return actions[type]?.[language] || actions[type]?.en || type;
  };

  const translateActionLabel = (action) => {
    const actions = {
      Sowing: { en: 'Sowing', hi: 'बोना', bn: 'বপন', ta: 'விதைப்பு', te: 'విత్తనం', mr: 'बियाणे', gu: 'બિયારણ', kn: 'ಬಿತ್ತನೆ', ml: 'വിതയ്ക്കൽ', pa: 'ਬੀਜ ਬੋਣਾ', ur: 'بیج ڈالنا', or: 'ବୀଜ ବୁଣନ୍ତୁ' },
      Harvesting: { en: 'Harvesting', hi: 'कटाई', bn: 'ফসল তোলা', ta: 'பயிர் அறுவடை', te: 'పంట కోత', mr: 'कापणी', gu: 'ફસ્લ કાપણી', kn: 'ಸುಗ್ಗಿ', ml: 'കൊയ്തുയരിക്കൽ', pa: 'ਫਸਲ ਕੱਟਣਾ', ur: 'فصل کٹانا', or: 'ଫସଲ କାଟନ୍ତୁ' },
      Irrigation: { en: 'Irrigation', hi: 'सिंचाई', bn: 'সেচ', ta: 'நீர்ப்பாசனம்', te: 'నీటి పంట', mr: 'सिंचन', gu: 'સિંચાઈ', kn: 'ನೀರಾವರಿ', ml: 'ജലസേചനം', pa: 'ਸਿੰਚਾਈ', ur: 'سائٹ', or: 'ସିଚନ' },
      Drainage: { en: 'Drainage', hi: 'जल निकासी', bn: 'নিষ্কাশন', ta: 'வடிகால்', te: 'డ్రైనేజ్', mr: 'निचरा', gu: 'ડ્રેનેજ', kn: 'ಒಳಚರಂಡಿ', ml: 'ഡ്രെയിനേജ്', pa: 'ਨਿਕਾਸੀ', ur: 'نکاسی آب', or: 'ନିଷ୍କାସନ' },
      Monitoring: { en: 'Monitoring', hi: 'निगरानी', bn: 'পর্যবেক্ষণ', ta: 'கண்காணிப்பு', te: 'పర్యవేక్షణ', mr: 'निगराणी', gu: 'નિરીક્ષણ', kn: 'ಮೇಲ್ವಿಚಾರಣೆ', ml: 'നിരീക്ഷണം', pa: 'ਨਿਗਰਾਨੀ', ur: 'نگرانی', or: 'ନିରୀକ୍ଷଣ' },
      'Disease Monitoring': { en: 'Disease Monitoring', hi: 'रोग निगरानी', bn: 'রোগ পর্যবেক্ষণ', ta: 'நோய் கண்காணிப்பு', te: 'వ్యాధి పర్యవేక్షణ', mr: 'रोग निरीक्षण', gu: 'રોગ નિરીક્ષણ', kn: 'ರೋಗ ಮೇಲ್ವಿಚಾರಣೆ', ml: 'രോഗ നിരീക്ഷണം', pa: 'ਰੋਗ ਨਿਗਰਾਨੀ', ur: 'بیماری کی نگرانی', or: 'ରୋଗ ନିରୀକ୍ଷଣ' }
    };
    return actions[action]?.[language] || action;
  };

  const translatePriorityLabel = (priority) => {
    const labels = {
      High: { en: 'High', hi: 'जरूरी', bn: 'জরুরি', ta: 'அவசரம்', te: 'అత్యవసరం', mr: 'तातडीचे', gu: 'જરૂરી', kn: 'ತುರ್ತು', ml: 'അടിയന്തിരം', pa: 'ਤੁਰੰਤ', ur: 'فوری', or: 'ଜରୁରୀ' },
      Medium: { en: 'Medium', hi: 'महत्वपूर्ण', bn: 'গুরুত্বপূর্ণ', ta: 'முக்கியம்', te: 'ముఖ్యమైనది', mr: 'महत्वाचे', gu: 'મહત્વપૂર્ણ', kn: 'ಪ್ರಮುಖ', ml: 'പ്രാധാന്യം', pa: 'ਮਹੱਤਵਪੂਰਨ', ur: 'اہم', or: 'ମହତ୍ୱପୂର୍ଣ୍ଣ' },
      Low: { en: 'Low', hi: 'जानकारी', bn: 'তথ্য', ta: 'தகவல்', te: 'సమాచారం', mr: 'माहिती', gu: 'માહિતી', kn: 'ಮಾಹಿತಿ', ml: 'വിവരം', pa: 'ਜਾਣਕਾਰੀ', ur: 'معلومات', or: 'ସୂଚନା' }
    };
    return labels[priority]?.[language] || priority;
  };

  const translateYieldStatus = (status) => {
    const statuses = {
      Good: { en: 'Good', hi: 'अच्छा', bn: 'ভালো', ta: 'சரி', te: 'బాగుంది', mr: 'चांगले', gu: 'સારો', kn: 'ಒಳ್ಳೆಯದು', ml: 'ശരിയാണ്', pa: 'ਚੰਗਾ', ur: 'اچھا', or: 'ଭଲ' },
      Excellent: { en: 'Excellent', hi: 'बहुत अच्छा', bn: 'চমৎকার', ta: 'மிகவும் நல்லது', te: 'అత్యంత మంచి', mr: 'अतिशय चांगले', gu: 'બહુ સારું', kn: 'ಅತ್ಯುತ್ತಮ', ml: 'വളരെ നല്ലത്', pa: 'ਬਹੁਤ ਵਧੀਆ', ur: 'بہت اچھا', or: 'ଅତିଭଲ' }
    };
    return statuses[status]?.[language] || status;
  };

  const getRecommendationTip = (crop, action) => {
    const cropKey = normalizeCropKey(crop);
    const tips = {
      wheat: {
        Sowing: { en: 'Perfect time to sow wheat for strong growth.', hi: 'गेहूं बोने का सही समय है।', bn: 'গম বপনের সঠিক সময়।', ta: 'கோதுமையை விதைப்பதற்கு சரியான நேரம்.', te: 'గోధుమను విత్తడానికి సరైన సమయం.', mr: 'गहू बियाण्याला योग्य वेळ आहे.', gu: 'ગहुँ વાવવાનો યોગ્ય સમય છે.', kn: 'ಗೋಧಿ ಬಿತ್ತಲು ಸರಿಯಾದ ಸಮಯ.', ml: 'ഗോതമ്പ് വിതയ്ക്കാൻ ശരിയായ സമയം.', pa: 'ਗੰਨ ਬੋਣ ਦਾ ਠੀਕ ਸਮਾਂ ਹੈ।', ur: 'گندم ڈالنے کا موزوں وقت ہے۔', or: 'ଗହମ ବୁଣିବା ପାଇଁ ସୁପାରିଶକୁତ୍ର ଅବସର।' },
        Harvesting: { en: 'Harvest when moisture is lower and grains are dry.', hi: 'जब अनाज सूखा हो तो काटें।', bn: 'দানা শুকালে ফসল কাটা উচিত।', ta: 'தானியங்கள் வறண்டவுடன் அறுவடை செய்யுங்கள்.', te: 'ధాన్యాలు ఎండిన తర్వాత కోయండి.', mr: 'धान्य सुकल्यावर कापणी करा.', gu: 'હેવખેર શુક્લા પછી કાપો.', kn: 'ಅಂಬುಗಳು ಒಣಗಿದ ನಂತರ ಸುಗ್ಗಿ ಮಾಡಿ.', ml: 'തരികൾ വര്ഷിച്ചു വന്നതോടെ കൊയ്തെടുക്കുക.', pa: 'ਜਦੋਂ ਦਾਣੇ ਸੁੱਕ ਜਾਣ ਤਾਂ ਫਸਲ ਕੱਟੋ।', ur: 'جب دانے خشک ہوں تو فصل کاٹیں۔', or: 'ଧାନ୍ୟ ସୁକ୍ଷମ ହେବା ପରେ କାଟନ୍ତୁ।' },
        Irrigation: { en: 'Water early morning to reduce stress on the crop.', hi: 'फसल पर दबाव कम करने के लिए सुबह पानी दें।', bn: 'ফসলের ওপর চাপ কমাতে সকালেই পানি দিন।', ta: 'பயிரின் அழுத்தத்தைக் குறைக்க காலை நீர் பாய்ச்சுங்கள்.', te: 'పంటపై ఒత్తిడిని తగ్గించడానికి సాయంత్రానికి లేదా ఉదయాన్నే నీరు చల్లండి.', mr: 'पिकावर ताण कमी करण्यासाठी सकाळी पाणी द्या.', gu: 'પાક ઉપર તાણ ઘટાડવા માટે વહેલી સવારમાં પાણી આપો.', kn: 'ಬೆಳೆಮೇಲಿನ ಒತ್ತಡ ಕಡಿಮೆ ಮಾಡಲು ಬೆಳಿಗ್ಗೆ ನೀರನ್ನು ಒದಗಿಸಿ.', ml: 'വിളത്തിലെ സമ്മർദ്ദം കുറയ്ക്കാൻ രാവിലെ വെള്ളം കൊടുക്കുക.', pa: 'ਫਸਲ ਤੇ ਦਬਾਅ ਘਟਾਉਣ ਲਈ ਸਵੇਰੇ ਪਾਣੀ ਦਿਓ।', ur: 'فصل پر دباؤ کم کرنے کے لیے صبح پانی دیں۔', or: 'ପ୍ରତିବନ୍ଧକୁ କମ କରିବା ପାଇଁ ସକାଳେ ପାଣି ଦିଅନ୍ତୁ।' }
      },
      sugarcane: {
        Sowing: { en: 'Keep the field prepared and plant healthy cane setts.', hi: 'खेत तैयार रखें और स्वस्थ गन्ने के Setts रोपें।', bn: 'খেত প্রস্তুত রাখুন এবং সুস্থ আখের চারা রোপণ করুন।', ta: 'தரிசு நிலத்தை தயார் செய்து ஆரோக்கியமான கரும்பு விதைகளை நடவும்.', te: 'భూమిని సిద్ధం చేసి ఆరోగ్యమైన చెరకు మొక్కలు నాటండి.', mr: 'शेत तयारी करा आणि निरोगी ऊस रोपण करा.', gu: 'ખેતર તૈયાર રાખો અને સ્વસ્થ ખાધની રોપણ કરો.', kn: 'ಹೊಲವನ್ನು ಸಿದ್ಧಪಡಿಸಿ ಆರೋಗ್ಯಕರ ಕಬ್ಬು ಸಸಿ ನೆಡಿರಿ.', ml: 'വളവുകൾ തയ്യാറാക്കി ആരോഗ്യകരമായ ചൂരങ്ങൾ നട്ട്.', pa: 'ਖੇਤ ਦੀ ਤਿਆਰੀ ਕਰੋ ਅਤੇ ਸਹੀ ਗੰਨਾ ਬੀਜ ਰੱਖੋ।', ur: 'کھیت تیاری کریں اور صحت مند گنے کے ٹکڑے لگائیں۔', or: 'ଫସଲ କ୍ଷେତ୍ରକୁ ପ୍ରସ୍ତୁତ କରି ସୁସ୍ଥ ଆକ ରୋପଣ କରନ୍ତୁ।' },
        Harvesting: { en: 'Plan the cut during dry weather to protect sugar recovery.', hi: 'चीनी की गुणवत्ता के लिए शुष्क मौसम में कटाई करें।', bn: 'চিনি উৎপাদন ভালো রাখার জন্য শুকনো আবহাওয়ায় কাটুন।', ta: 'சர்க்கரை தரத்தை பாதுகாக்க வறண்ட காலத்தில் அறுவடை செய்யுங்கள்.', te: 'చక్కెర గుణాన్ని பாதுகாக்க పొడి వాతావరణంలో కోయండి.', mr: 'साखर गुणवत्ता राखण्यासाठी कोरडे हवामानात कापणी करा.', gu: 'કેડી兑તા ગુણવત્તા માટે ઉનાળા હવામાનમાં કાપો.', kn: 'ಚಕ್ಕರಿಯನ್ನು ಕಾಪಾಡಲು ಶುಷ್ಕ ಹವಾಮಾನದಲ್ಲಿ ಸುಗ್ಗಿ ಮಾಡಿ.', ml: 'ടെൻഷൻ പരിരക്ഷിക്കാൻ വറ്റിയ കാലത്ത് കൊയ്തെടുക്കുക.', pa: 'ਸ਼ੱਕਰ ਦੀ ਗੁਣਵੱਤਾ ਲਈ ਸੁੱਕੇ ਮੌਸਮ ਵਿੱਚ ਕੱਟੋ।', ur: 'چینی کی معیار کے لیے خشک موسم میں کاٹیں۔', or: 'ଚିନି ଗୁଣବତ୍ତା ରଖିବା ପାଇଁ ଶୁଷ୍କ ଆବାହାବାରେ କଟନ୍ତୁ।' },
        Irrigation: { en: 'Keep soil moisture stable, especially during rapid growth stages.', hi: 'उच्च विकास के चरण में मिट्टी की नमी बनाए रखें।', bn: 'দ্রুত বৃদ্ধির সময় মাটির আর্দ্রতা ঠিক রাখুন।', ta: 'விரைவான வளர்ச்சியில் மண் ஈரப்பதத்தை பராமரியுங்கள்.', te: 'విస్తృత వృద్ధి దశలలో మట్టిలో తేమను నిలకడగా ఉంచండి.', mr: 'वेगवान वाढीदरम्यान मातीची ओल संतुलित ठेवा.', gu: 'ઝડપી વૃદ્ધિ દરમિયાન માટીનું પાણી勁થી રાખો.', kn: 'ವೇಗದ ಬೆಳವಣಿಗೆಯ ಸಮಯದಲ್ಲಿ ಮಣ್ಣಿನ ತೇವವನ್ನು稳态ವಾಗಿ ಇರಿಸಿ.', ml: 'വേഗത്തിൽ വളരുന്ന ഘട്ടങ്ങളിൽ മണ്ണിന്റെ തണ്ണീര്രം നിലനിർത്തുക.', pa: 'ਤੇਜ਼ ਵਿਕਾਸ ਦੇ ਦੌਰਾਨ ਮਿੱਟੀ ਦੀ ਨਮੀ ਬਣਾਈ ਰੱਖੋ।', ur: 'تیزی سے بڑھنے والے مرحلے میں مٹی کی نمی کو مستحکم رکھیں۔', or: 'ଦ୍ରୁତ ବୃଦ୍ଧିରେ ମୃତ୍ତିକାର ଆର୍ଦ୍ରତା ସ୍ଥିର ରଖନ୍ତୁ।' }
      },
      cotton: {
        Sowing: { en: 'Sow cotton when soil is warm and moisture is balanced.', hi: 'गर्म मिट्टी और संतुलित नमी में कपास बोएं।', bn: 'গরম মাটি ও সামঞ্জস্যপূর্ণ আর্দ্রতায় তুলা বপন করুন।', ta: 'மண் சூடாக இருக்கும் போது பருத்தி விதைக்கவும்.', te: 'మట్టి వెచ్చగా మరియు తేమ సమతుల్యంగా ఉన్నప్పుడు పత్తిని విత్తండి.', mr: 'माती उष्ण असताना आणि ओल संतुलित असताना कापूस पेरणे.', gu: 'માટી ગરમી ધરાવતી હોય તે સમયે કપાસ વાવો.', kn: 'ಮಣ್ಣು ಬೆಚ್ಚಗಿದ್ದಾಗ ಮತ್ತು ತೇವವು ಸಮತೋಲನದಲ್ಲಿದ್ದಾಗ ಹತ್ತಿ ಬಿತ್ತಿ ಮಾಡಿ.', ml: 'മണ്ണ് ചൂടുള്ളതും തണ്ണീര് സമതുലിതവുമായപ്പോൾ പട്ട് വിതയ്ക്കുക.', pa: 'ਜਦੋਂ ਮਿੱਟੀ ਗਰਮ ਹੋਵੇ ਅਤੇ ਨਮੀ ਬਕਾਇਆ ਹੋਵੇ ਤਾਂ ਕਪਾਹ ਬੋਵੋ', ur: 'جب مٹی گرم ہو اور نمی متوازن ہو تو کپاس بونے۔', or: 'ମୃତ୍ତିକା ଗରମ ଥିବା ସମୟରେ କପାସ ବୁଣନ୍ତୁ।' },
        Harvesting: { en: 'Pick cotton once bolls have opened fully.', hi: 'जब बीजों के खोल खुल जाएं तब कपास काटें।', bn: 'গুটি পুরোপুরি খুলে গেলে তুলা তোলা উচিত।', ta: 'மூட்டைகள் முழுமையாக திறந்த பிறகு பருத்தி அறுவடை செய்யுங்கள்.', te: 'పొగడ్లు పూర్తిగా తెరవగానే పత్తిని కోయండి.', mr: 'कापूस फुललेली झाल्यावर कापणी करा.', gu: 'કપાસ પૂરી રીતે ખુલી ગયા પછી કાપો.', kn: 'ತोंಡುಗಳು ಸಂಪೂರ್ಣವಾಗಿ ತೆರೆಯದಿದ್ದಾಗ ಹತ್ತಿಯನ್ನು ಸುಗ್ಗಿ ಮಾಡಿ.', ml: 'ബോൾസ് മുഴുവൻ തുറന്നപ്പോൾ പട്ട് കൊയ്തെടുക്കുക.', pa: 'ਜਦੋਂ ਬੋਲล์ ਪੂਰੀ ਤਰ੍ਹਾਂ ਖੁੱਲ ਜਾਣ ਤਾਂ ਕਪਾਹ ਕੱਟੋ।', ur: 'جب گولی پوری طرح کھل جائے تو کپاس کاٹیں۔', or: 'ବୋଲ୍ସ ସମ୍ପୂର୍ଣ୍ଣ ରୂପେ ଖୋଲିବା ପରେ କପାସ କାଟନ୍ତୁ।' },
        Irrigation: { en: 'Avoid overwatering so roots stay healthy and balanced.', hi: 'अति पानी से बचें ताकि जड़ें स्वस्थ रहें।', bn: 'অতিরিক্ত পানি দেবেন না যাতে শিকড় সুস্থ থাকে।', ta: 'மிதமான நீர்ப்பாசனம் அவசியம், வேர்கள் ஆரோக்கியமாக இருக்கும்.', te: 'మిగిలిన నీరు ఇవ్వకండి, వేర్లు బాగుండేలా చూసుకోండి.', mr: 'अतिवृष्टि टाळा, मुळे निरोगी राहतील.', gu: 'અતિપાણી ન આપો જેથી મૂળ સ્વસ્થ રહે.', kn: 'ಅತಿಯಾಗಿ ನೀರು ಕೊಡುವುದಿಲ್ಲ, ಬೇರುಗಳು ಆರೋಗ್ಯಕರವಾಗಿರುತ್ತವೆ.', ml: 'അനാവശ്യമായ വെള്ളം കൊടുക്കരുത്, വേരുകൾ സുഖമായി ഇരിക്കും.', pa: 'ਜ਼ਿਆਦਾ ਪਾਣੀ ਨਾ ਦਿਓ ਤਾਂ ਜੋ ਜੜ੍ਹੇ ਸਿਹਮਣੀ ਰਹਿਣ।', ur: 'زیادہ پانی نہ دیں تاکہ جڑیں صحت مند رہیں۔', or: 'ଅତିଶୟ ପାଣି ଦେବନ୍ତୁ ନାହିଁ, ମୂଳକୁ ସୁସ୍ଥ ରଖିବା ପାଇଁ।' }
      }
    };
    return tips[cropKey]?.[action]?.[language] || tips[cropKey]?.[action]?.en || 'Follow the field guide';
  };

  const getAlertTypeLabel = (type) => {
    const labels = {
      'Heavy Rain Alert': { en: 'Heavy Rain Alert', hi: 'तेज़ बारिश की चेतावनी', bn: 'তীব্র বৃষ্টির সতর্কতা', ta: 'வீச்சான மழை எச்சரிக்கை', te: 'తీవ్రమైన వర్ష హెచ్చరిక', mr: 'तुफान पावसाचा इशारा', gu: 'ભારે વરસાદની ચેતવણી', kn: 'ತೀವ್ರ ಮಳೆ ಎಚ್ಚರಿಕೆ', ml: 'തീവ്ര മഴ മുന്നറിയിപ്പ്', pa: 'ਭਾਰੀ ਬਰਿਸ਼ਤ ਦੀ ਚੇਤਾਵਨੀ', ur: 'شدید بارش کی الرٹ', or: 'ତୀବ୍ର ବର୍ଷା ଚେତାବନୀ' },
      'Pest Warning': { en: 'Pest Warning', hi: 'कीट चेतावनी', bn: 'পোকা সতর্কতা', ta: 'கிருமி எச்சரிக்கை', te: 'కీటక హెచ్చరిక', mr: 'किटक इशारा', gu: 'કીટ ચેતવણી', kn: 'ಕೀಟಗಳು ಎಚ್ಚರಿಕೆ', ml: 'കീട മുന്നറിയിപ്പ്', pa: 'ਕੀੜਿਆਂ ਦੀ ਚੇਤਾਵਨੀ', ur: 'کیڑوں کی الرٹ', or: 'କୀଟ ଚେତାବନୀ' },
      'Irrigation Reminder': { en: 'Irrigation Reminder', hi: 'सिंचाई अनुस्मारक', bn: 'সেচের অনুস্মারক', ta: 'நீர்ப்பாசன நினைவூட்டல்', te: 'నీటి వినియోగ జ్ఞాపకం', mr: 'सिंचन स्मरणपत्र', gu: 'સિંચાઈ રિમાઇન્ડર', kn: 'ನೀರಾವರಿ ಜ್ಞಾಪನೆ', ml: 'ജലസേചന റിമൈൻഡർ', pa: 'ਸਿੰਚਾਈ ਯਾਦ ਦਿਵਾਣ', ur: 'سائٹ یاد دہانی', or: 'ସିଚନ ସ୍ମୃତି' }
    };
    return labels[type]?.[language] || type;
  };

  const getAlertSummary = (type) => {
    const summaries = {
      'Heavy Rain Alert': { en: 'Heavy rainfall expected soon.', hi: 'तेज़ बारिश की संभावना है।', bn: 'শীঘ্রই ভারী বৃষ্টি হতে পারে।', ta: 'வீச்சான மழை விரைவில் வரும்.', te: 'త్వరలో తీవ్ర వర్షం వచ్చే అవకాశం ఉంది.', mr: 'लवकर जोरदार पाऊस पडण्याची शक्यता आहे.', gu: 'લાંબા સમયથી ભારે વરસાદ થવાની સંભાવના છે.', kn: 'ಶೀಘ್ರದಲ್ಲೇ ಭಾರೀ ಮಳೆ ಸಂಭವಿಸಬಹುದು.', ml: 'ഉടൻ കനത്ത മഴ പ്രതീക്ഷിക്കുന്നു.', pa: 'ਟੀਕ ਜਲਦ ਬਰਿਸ਼ਤ ਹੋਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ।', ur: 'جلدی شدید بارش کا امکان ہے۔', or: 'ଶୀଘ୍ରେ ତୀବ୍ର ବର୍ଷା ହେବାର ସମ୍ଭାବନା।' },
      'Pest Warning': { en: 'Humidity may increase pest activity.', hi: 'नमी के कारण कीट सक्रिय हो सकते हैं।', bn: 'আর্দ্রতার কারণে পোকা সক্রিয় হতে পারে।', ta: 'ஈரப்பதம் காரணமாக பூச்சிகள் அதிகரிக்கலாம்.', te: 'తేమ కారణంగా కీటకాలు పెరగవచ్చు.', mr: 'आर्द्रतेमुळे किडी वाढू शकतात.', gu: 'આર્દ્રતા કારણે પોપટો વધુ કાર્યરત થઈ શકે છે.', kn: 'ಆವಿಯಾದತೆ ಕಾರಣದಿಂದ ಕೀಟಗಳು ಹೆಚ್ಚು ಸಕ್ರಿಯವಾಗಬಹುದು.', ml: 'ആർദ്രത കാരണം കീടങ്ങൾ വളരാം.', pa: 'ਨਮੀ ਕਾਰਨ ਕੀੜੇ ਜ਼ਿਆਦਾ ਅਕਤੂ ਹੋ ਸਕਦੇ ਹਨ।', ur: 'نمی کی وجہ سے کیڑے زیادہ سرگرم ہو سکتے ہیں۔', or: 'ଆର୍ଦ୍ରତା ହେତୁ କୀଟଗୁଡ଼ିକ ଅଧିକ ସକ୍ରିୟ ହୋଇପାରନ୍ତି।' },
      'Irrigation Reminder': { en: 'Plan irrigation to avoid crop stress.', hi: 'पानी की योजना बनाकर फसल को नुकसान से बचाएं।', bn: 'ফসলের চাপ কমাতে সেচের পরিকল্পনা করুন।', ta: 'பயிர் அழுத்தத்தை தவிர்க்க நீர்ப்பாசனத்தை திட்டமிடுங்கள்.', te: 'పంట ఒత్తిడిని నివారించడానికి నీరు పంచే యోజన చేయండి.', mr: 'पिकावर ताण टाळण्यासाठी सिंचन वेळापत्रक आखा.', gu: 'પાક પર તણાવ ટાળવા માટે સિંચનનું આયોજન કરો.', kn: 'ಬೆಳೆ ಒತ್ತಡ ತಪ್ಪಿಸಲು ನೀರಾವರಿ ಯೋಜನೆ ಮಾಡಿ.', ml: 'വിളത്തിൽ സമ്മർദ്ദം ഒഴിവാക്കാൻ ജലസേചനം ആസൂത്രണം ചെയ്യുക.', pa: 'ਫਸਲ ਦੇ ਤਣਾਅ ਤੋਂ ਬਚਣ ਲਈ ਸਿੰਚਾਈ ਦਾ ਯੋਜਨਾਬੰਧ ਕਰੋ।', ur: 'فصل پر دباؤ سے بچنے کے لیے پانی کی منصوبہ بندی کریں۔', or: 'ଫସଲ କ୍ଷତିରୁ ବଞ୍ଚିବା ପାଇଁ ସିଚନ ଯୋଜନା କରନ୍ତୁ।' }
    };
    return summaries[type]?.[language] || summaries[type]?.en || type;
  };

  const getLocalizedMarketCrop = (crop) => getLocalizedCropName(crop);

  const farmNavItems = [
    { key: 'overview', label: language === 'hi' ? 'मुख्य' : language === 'bn' ? 'সংক্ষিপ্ত' : language === 'ta' ? 'கண்ணோர்வு' : language === 'te' ? 'సారాంశం' : language === 'mr' ? 'सारांश' : language === 'gu' ? 'સારાંશ' : language === 'kn' ? 'ಸಂಕ್ಷೇಪ' : language === 'ml' ? 'ലഘു ലേഖനം' : language === 'pa' ? 'ਸੰਖੇਪ' : language === 'ur' ? 'خلاصہ' : language === 'or' ? 'ସାରାଂଶ' : 'Overview' },
    { key: 'alerts', label: language === 'hi' ? 'अलर्ट' : language === 'bn' ? 'সতর্কতা' : language === 'ta' ? 'எச்சரிக்கைகள்' : language === 'te' ? 'హెచ్చరికలు' : language === 'mr' ? 'सूचना' : language === 'gu' ? 'ચેતવણીઓ' : language === 'kn' ? 'ಸೂಚನೆಗಳು' : language === 'ml' ? 'അലേർട്ടുകൾ' : language === 'pa' ? 'ਚੇਤਾਵਨੀਆਂ' : language === 'ur' ? 'الرٹس' : language === 'or' ? 'ଚେତାବନୀ' : 'Alerts' },
    { key: 'forecast', label: language === 'hi' ? 'मौसम' : language === 'bn' ? 'আবহাওয়া' : language === 'ta' ? 'வானிலை' : language === 'te' ? 'వాతావరణం' : language === 'mr' ? 'हवामान' : language === 'gu' ? 'હવામાન' : language === 'kn' ? 'ಹವಾಮಾನ' : language === 'ml' ? 'കാലാവസ്ഥ' : language === 'pa' ? 'ਮੌਸਮ' : language === 'ur' ? 'موسم' : language === 'or' ? 'ଆବାହାବା' : 'Forecast' },
    { key: 'recommendations', label: language === 'hi' ? 'सलाह' : language === 'bn' ? 'পরামর্শ' : language === 'ta' ? 'பரிந்துரைகள்' : language === 'te' ? 'సలహాలు' : language === 'mr' ? 'सल्लाह' : language === 'gu' ? 'સલાહ' : language === 'kn' ? 'ಸಲಹೆಗಳು' : language === 'ml' ? 'ശുപാർശകൾ' : language === 'pa' ? 'ਸਲਾਹ' : language === 'ur' ? 'مشورہ' : language === 'or' ? 'ପରାମର୍ଶ' : 'Advice' }
  ];

  const getWeatherIcon = (condition) => {
    switch(condition) {
      case 'Sunny': return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'Partly Cloudy': return <CloudSun className="w-8 h-8 text-yellow-400" />;
      case 'Cloudy': return <Cloud className="w-8 h-8 text-gray-400" />;
      case 'Light Rain': return <CloudRain className="w-8 h-8 text-blue-400" />;
      case 'Heavy Rain': return <CloudRain className="w-8 h-8 text-blue-600" />;
      default: return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getPriorityStyle = (priority) => {
    switch(priority) {
      case 'High': return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: 'text-red-500', badge: 'bg-red-500' };
      case 'Medium': return { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-500', badge: 'bg-yellow-500' };
      case 'Low': return { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: 'text-green-500', badge: 'bg-green-500' };
      default: return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', icon: 'text-gray-500', badge: 'bg-gray-500' };
    }
  };

  const getActionIcon = (action) => {
    switch(action) {
      case 'Sowing': return <Sprout className="w-5 h-5" />;
      case 'Harvesting': return <Scissors className="w-5 h-5" />;
      case 'Irrigation': return <Droplets className="w-5 h-5" />;
      default: return <Tractor className="w-5 h-5" />;
    }
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'Sowing': return 'bg-green-100 text-green-700 border-green-200';
      case 'Harvesting': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Irrigation': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const getLocalizedTaskLabel = (label) => {
    const labels = {
      Inspect: { en: 'Inspect', hi: 'निरीक्षण', bn: 'পরিদর্শন', ta: 'ஆய்வு', te: 'పరిశీలించండి', mr: 'तपासणी', gu: 'તપાસ', kn: 'ಪರಿಶೀಲನೆ', ml: 'പരിശോധിക്കുക', pa: 'ਜਾਂਚ', ur: 'معائنہ', or: 'ଯାଞ୍ଚ' },
      Review: { en: 'Review', hi: 'जांचें', bn: 'পর্যালোচনা', ta: 'மதிப்பாய்வு', te: 'సమీక్ష', mr: 'पुनरावलोकन', gu: 'સમીક્ષા', kn: 'ಪರಿಶೀಲನೆ', ml: 'അവലോകനം', pa: 'ਸਮੀਖਿਆ', ur: 'جائزہ', or: 'ସମୀକ୍ଷା' }
    };
    return labels[label]?.[language] || labels[label]?.en || label;
  };

  // The visual design remains from the first dashboard, while the
  // recommendation, alert and task logic comes from the second dashboard.
  const weatherToday = useMemo(() => ({
    temperature: Number(farmerData.weatherForecast?.today?.temp || 0),
    humidity: Number(farmerData.weatherForecast?.today?.humidity || 0),
    rainfall: Number(farmerData.weatherForecast?.today?.rainfall || 0),
    windSpeed: Number(farmerData.weatherForecast?.today?.windSpeed || 0),
    condition: farmerData.weatherForecast?.today?.condition || 'Sunny'
  }), [farmerData]);

  const dynamicRecommendations = useMemo(() => {
    return farmerData.farmDetails.crops.map((crop) => ({
      crop,
      ...generateCropRecommendation(crop, weatherToday)
    }));
  }, [farmerData, weatherToday]);

  const filteredRecommendations = useMemo(() => {
    if (selectedCrop === 'all') return dynamicRecommendations;
    return dynamicRecommendations.filter((item) => item.crop === selectedCrop);
  }, [selectedCrop, dynamicRecommendations]);

  const localizedRecommendations = filteredRecommendations.map((rec) => ({
    ...rec,
    cropIcon: rec.crop === 'Wheat' ? '🌾' : rec.crop === 'Sugarcane' ? '🎋' : '🌿',
    actionIcon: rec.icon,
    crop: getLocalizedCropName(rec.crop),
    action: translateActionLabel(rec.action),
    recommendation: rec.message,
    simpleTip: rec.message,
    confidence: 'Dynamic',
    color: rec.action === 'Irrigation' ? 'blue' : rec.action === 'Drainage' ? 'amber' : 'green'
  }));

  const dynamicAlerts = useMemo(() => {
    const alerts = [];
    const { temperature, humidity, rainfall, windSpeed } = weatherToday;

    if (rainfall > 10) {
      alerts.push({
        id: 'rainfall',
        type: 'Heavy Rain Alert',
        typeIcon: '🌧️',
        message: 'Significant rainfall detected. Check field drainage.',
        simpleMessage: 'Check field drainage because rainfall is high.',
        priority: 'High',
        action: 'Prepare drainage in fields'
      });
    }

    if (temperature >= 35) {
      alerts.push({
        id: 'temperature',
        type: 'Temperature Alert',
        typeIcon: '🌡️',
        message: 'High temperature detected. Monitor crop water requirements.',
        simpleMessage: 'Monitor crops and water needs.',
        priority: 'High',
        action: 'Monitor field and irrigation'
      });
    }

    if (humidity >= 80) {
      alerts.push({
        id: 'humidity',
        type: 'Pest Warning',
        typeIcon: '🐛',
        message: 'High humidity may increase disease and pest activity.',
        simpleMessage: 'Inspect crops for disease or pests.',
        priority: 'Medium',
        action: 'Inspect crops'
      });
    }

    if (windSpeed >= 25) {
      alerts.push({
        id: 'wind',
        type: 'Wind Alert',
        typeIcon: '💨',
        message: 'Higher wind speed detected. Monitor crops for stress or damage.',
        simpleMessage: 'Check crops after strong winds.',
        priority: 'Medium',
        action: 'Monitor field'
      });
    }

    return alerts;
  }, [weatherToday]);

  const localizedAlerts = dynamicAlerts.map((alert) => ({
    ...alert,
    type: getAlertTypeLabel(alert.type),
    action: alert.action,
  }));

  // Keep the second dashboard's task behavior: three concrete farm tasks,
  // with completion persisted by the first dashboard's localStorage logic.
  const farmTasks = [
    {
      id: 'cotton',
      title: `${getLocalizedCropName('Cotton')}: ${translateActionLabel('Irrigation')}`,
      detail: dynamicRecommendations.find((item) => item.crop === 'Cotton')?.message || 'Monitor cotton irrigation needs.',
      icon: '💧'
    },
    {
      id: 'wheat',
      title: `${getLocalizedCropName('Wheat')}: ${getLocalizedTaskLabel('Inspect')}`,
      detail: dynamicRecommendations.find((item) => item.crop === 'Wheat')?.message || 'Inspect wheat field.',
      icon: '🌱'
    },
    {
      id: 'sugarcane',
      title: `${getLocalizedCropName('Sugarcane')}: ${getLocalizedTaskLabel('Review')}`,
      detail: dynamicRecommendations.find((item) => item.crop === 'Sugarcane')?.message || 'Review sugarcane field.',
      icon: '🚜'
    },
    ...localizedAlerts.slice(0, 1).map((alert) => ({
      id: `alert-${alert.id}`,
      title: alert.type,
      detail: alert.action,
      icon: alert.typeIcon
    }))
  ];

  const toggleTask = (taskId) => {
    setCompletedTasks((current) => current.includes(taskId)
      ? current.filter((id) => id !== taskId)
      : [...current, taskId]);
  };

  const resetFarmPlan = () => setCompletedTasks([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-sky-50 to-yellow-50 p-4 md:p-6">
      
      {/* Header with Language Toggle */}
      <div className="flex flex-wrap justify-between items-center mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
              🌱
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {t.title}
            </h1>
            <p className="text-gray-500 text-sm">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-3 md:mt-0">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full transition-all disabled:opacity-50 text-sm font-medium shadow-lg hover:shadow-xl"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t.refresh}
          </button>
        </div>
      </div>

      {/* Preferred language selector */}
      <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-soft border border-green-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Languages className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t.preferredLanguage}</p>
              <p className="text-xs text-gray-500">{t.languageHint}</p>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full appearance-none rounded-xl border border-green-200 bg-green-50 px-4 py-3 pr-10 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-green-600">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Phone notification alerts */}
      <div className="mb-6 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-red-50 p-4 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
              <Smartphone className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-800">{phoneText.title}</p>
                {phoneAlertsEnabled && <Bell className="h-4 w-4 text-orange-500" />}
              </div>
              <p className="text-xs text-gray-500">{phoneText.hint}</p>
            </div>
          </div>

          {phoneAlertsEnabled ? (
            <span className="inline-flex items-center gap-2 rounded-xl bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              <Bell className="h-4 w-4" />
              {phoneText.enabled}
            </span>
          ) : (
            <button
              type="button"
              onClick={enablePhoneAlerts}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              <Bell className="h-4 w-4" />
              {phoneText.enable}
            </button>
          )}
        </div>
        {typeof Notification !== 'undefined' && Notification.permission === 'denied' && !phoneAlertsEnabled && (
          <p className="mt-3 text-xs font-medium text-red-600">{phoneText.blocked}</p>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-soft border border-green-100 sticky top-4 z-10">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-green-600 font-semibold">{t.farmHub}</p>
              <h2 className="text-xl font-bold text-gray-800">{getLocalizedFarmerName()}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {farmNavItems.map((item) => (
                <button
                  key={item.key}
                  className="px-3 py-2 rounded-full text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-green-100 hover:text-green-700 transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-green-100 via-white to-yellow-100 p-4 border border-green-200">
            <div className="relative h-24 w-32 overflow-hidden rounded-[28px] bg-gradient-to-b from-sky-300 via-sky-100 to-amber-100 shadow-[0_20px_35px_rgba(16,185,129,0.25)] transform rotate-[-4deg]">
              <div className="absolute top-3 right-4 h-7 w-7 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.75)]" />
              <div className="absolute -bottom-5 -left-4 h-20 w-32 rounded-[50%] bg-emerald-600/80" />
              <div className="absolute -bottom-8 -right-8 h-24 w-36 rounded-[50%] bg-green-800/90" />
              <div className="absolute bottom-0 left-0 h-8 w-full skew-y-[-8deg] bg-lime-400/80" />
              <div className="absolute bottom-1 left-3 h-1 w-24 rotate-[-10deg] rounded-full bg-green-900/40" />
              <div className="absolute bottom-4 left-5 h-1 w-20 rotate-[-10deg] rounded-full bg-green-900/35" />
              <div className="absolute bottom-2 left-10 h-7 w-1 rotate-[18deg] rounded-full bg-green-950/60" />
              <div className="absolute bottom-3 left-16 h-9 w-1 rotate-[18deg] rounded-full bg-green-950/60" />
              <div className="absolute bottom-1 left-24 h-6 w-1 rotate-[18deg] rounded-full bg-green-950/60" />
              <div className="absolute bottom-0 left-1/2 h-12 w-6 -translate-x-1/2 skew-x-[-18deg] bg-amber-200/70" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-green-700">{t.title}</p>
              <p className="text-2xl font-black text-gray-800">{farmerData.farmDetails.name}</p>
              <p className="text-sm text-gray-600">{farmerData.farmDetails.location}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-5 shadow-soft border border-red-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-semibold">{t.notification}</p>
              <h3 className="text-lg font-bold text-gray-800">{t.farmAlerts}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">{farmerData.alerts.length} {t.live}</span>
          </div>
          <div className="space-y-3">
            {localizedAlerts.slice(0, 2).map((alert, index) => (
              <div key={index} className="rounded-2xl bg-white/80 p-3 border border-red-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="text-xl">{alert.typeIcon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{alert.type}</p>
                    <p className="text-xs text-gray-600">{alert.simpleMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-xl bg-red-600 text-white py-2.5 text-sm font-semibold hover:bg-red-700 transition-all">
            {t.viewAllAlerts}
          </button>
        </div>
      </div>

      {/* Farm Overview Cards with 3D style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Farm Name Card */}
        <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all border-b-4 border-green-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t.farmName}</p>
            <p className="text-lg font-bold text-gray-800">{farmerData.farmDetails.name}</p>
            <p className="text-xs text-gray-400">{farmerData.farmDetails.location}</p>
          </div>
        </div>

        {/* Area Card */}
        <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all border-b-4 border-blue-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <Tractor className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t.area}</p>
            <p className="text-lg font-bold text-gray-800">{formatArea(farmerData.farmDetails.area)}</p>
            <p className="text-xs text-gray-400">{farmerData.farmDetails.soilType}</p>
          </div>
        </div>

        {/* Crops Card */}
        <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all border-b-4 border-yellow-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-100 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
              <Leaf className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t.crops}</p>
            <p className="text-lg font-bold text-gray-800">{formatNumber(farmerData.farmDetails.crops.length)}</p>
            <p className="text-xs text-gray-400">{farmerData.farmDetails.crops.map(getLocalizedCropName).join(', ')}</p>
          </div>
        </div>

        {/* Weather Card */}
        <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              {getWeatherIcon(farmerData.weatherForecast.today.condition)}
              <span className="text-2xl">🌡️</span>
            </div>
            <p className="text-xs text-white/80 uppercase tracking-wide">{t.todayWeather}</p>
            <p className="text-3xl font-bold">{formatNumber(farmerData.weatherForecast.today.temp)}°C</p>
            <p className="text-xs text-white/80">{translateWeatherCondition(farmerData.weatherForecast.today.condition)}</p>
          </div>
        </div>
      </div>

      {/* Daily farm task planner */}
      <div className="mb-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">{farmPlanText.title}</h3>
            </div>
            <p className="mt-2 text-xs text-gray-500">{farmPlanText.hint}</p>
          </div>
          <button
            type="button"
            onClick={resetFarmPlan}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            {farmPlanText.reset}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {farmTasks.map((task) => {
            const isComplete = completedTasks.includes(task.id);
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => toggleTask(task.id)}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${isComplete ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-gray-50 hover:border-emerald-200 hover:bg-emerald-50/60'}`}
              >
                <span className="mt-0.5 text-xl">{isComplete ? '✓' : task.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-semibold ${isComplete ? 'text-emerald-700 line-through' : 'text-gray-800'}`}>{task.title}</span>
                  <span className="mt-1 block text-xs text-gray-500">{task.detail}</span>
                </span>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${isComplete ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-100 text-amber-700'}`}>
                  {isComplete ? farmPlanText.done : farmPlanText.pending}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weather Details Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Thermometer className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{t.feelsLike}</p>
            <p className="font-bold text-gray-800">{formatNumber(farmerData.weatherForecast.today.feelsLike)}°C</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{t.humidity}</p>
            <p className="font-bold text-gray-800">{formatNumber(farmerData.weatherForecast.today.humidity)}%</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
            <Wind className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{t.wind}</p>
            <p className="font-bold text-gray-800">{formatNumber(farmerData.weatherForecast.today.windSpeed)} km/h</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Waves className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{t.soilMoisture}</p>
            <p className="font-bold text-gray-800">{formatNumber(farmerData.weatherForecast.today.soilMoisture)}%</p>
          </div>
        </div>
      </div>

      {/* 7-Day Weather Forecast */}
      <div className="bg-white rounded-2xl p-5 shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{t.weekForecast}</h3>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {farmerData.weatherForecast.week.map((day, index) => (
            <div 
              key={index} 
              className={`text-center p-3 rounded-xl transition-all hover:scale-105 ${
                index === 0 ? 'bg-gradient-to-b from-sky-400 to-blue-500 text-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <p className={`text-xs font-medium ${index === 0 ? 'text-white/80' : 'text-gray-500'}`}>
                {day.day}
              </p>
              <div className="text-2xl my-2">{day.icon}</div>
              <p className={`text-lg font-bold ${index === 0 ? 'text-white' : 'text-gray-800'}`}>
                {formatNumber(day.temp)}°
              </p>
              {day.rain > 0 ? (
                <p className={`text-xs font-medium ${index === 0 ? 'text-white/90' : 'text-blue-500'}`}>
                  💧{formatNumber(day.rain)}mm
                </p>
              ) : (
                <p className={`text-xs ${index === 0 ? 'text-white/60' : 'text-gray-400'}`}>—</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Section - More Visual */}
      <div className="bg-white rounded-2xl p-5 shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{t.alerts}</h3>
        </div>
        
        <div className="space-y-3">
          {localizedAlerts.map((alert, index) => {
            const style = getPriorityStyle(alert.priority);
            return (
              <div 
                key={index} 
                className={`p-4 rounded-xl border-l-4 ${style.bg} transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{alert.typeIcon}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${style.badge}`}>
                        {translatePriorityLabel(alert.priority)}
                      </span>
                      <span className={`text-sm font-semibold ${style.text}`}>{getAlertTypeLabel(alert.type)}</span>
                    </div>
                    <p className="text-gray-700 font-medium">{getAlertSummary(alert.type)}</p>
                    <p className="text-gray-500 text-sm mt-1">{getAlertSummary(alert.type)}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4" />
                      <span className="font-medium">{translateAlertAction(alert.type)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Crop Recommendations - More Visual */}
      <div className="bg-white rounded-2xl p-5 shadow-lg mb-6">
        <div className="flex flex-wrap justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{t.recommendations}</h3>
          </div>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="all">{t.allCrops}</option>
            {farmerData.farmDetails.crops.map(crop => (
              <option key={crop} value={crop}>{getLocalizedCropName(crop)}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {localizedRecommendations.map((rec, index) => (
            <div 
              key={index} 
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-100 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
            >
              {/* Crop Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{rec.cropIcon}</span>
                  <div>
                    <h4 className="font-bold text-gray-800">{rec.crop}</h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getActionColor(rec.action)}`}>
                      {getActionIcon(rec.action)}
                      {rec.action}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{t.confidence}</p>
                  <p className="font-bold text-green-600">{rec.confidence}</p>
                </div>
              </div>

              {/* Timing */}
              <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{t.timing}:</span>
                <span className="text-sm font-semibold text-gray-800">{translateTiming(rec.timing)}</span>
              </div>

              {/* Recommendation */}
              <p className="text-sm text-gray-600 mb-3">{rec.recommendation}</p>
              
              {/* Simple Tip */}
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">{rec.simpleTip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Yield Prediction - Visual */}
      <div className="bg-white rounded-2xl p-5 shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{t.yieldPrediction}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(farmerData.yieldPrediction).map(([crop, data]) => (
            <div 
              key={crop} 
              className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-5 border border-green-100 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{data.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-800 capitalize">{getLocalizedCropName(crop)}</h4>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    data.status === 'Excellent' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {data.status === 'Excellent' ? <Award className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {translateYieldStatus(data.status)}
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500">{t.predicted}</p>
                  <p className="text-2xl font-bold text-green-600">{formatYield(data.predicted)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{t.lastYear}</p>
                  <p className="text-sm text-gray-600">{formatYield(data.lastYear)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-green-700">{data.change}</span>
                <span className="text-xs text-green-600">{t.increase}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Prices */}
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{t.marketPrices}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {farmerData.marketPrices.map((item, index) => (
            <div 
              key={index} 
              className="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800">{getLocalizedMarketCrop(item.crop)}</p>
                  <p className="text-xs text-gray-500">{units.quintal}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">{item.price}</p>
                <p className={`text-xs font-medium flex items-center gap-1 justify-end ${
                  item.trend === 'up' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {item.trend === 'up' ? '↑' : '→'} {item.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 font-medium">
          <Sprout className="w-5 h-5" />
          {t.sowNow}
        </button>
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 font-medium">
          <Droplets className="w-5 h-5" />
          {t.waterNow}
        </button>
        <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 font-medium">
          <Bug className="w-5 h-5" />
          {t.sprayNow}
        </button>
        <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 font-medium">
          <Scissors className="w-5 h-5" />
          {t.harvestNow}
        </button>
      </div>

    </div>
  );
};

export default FarmerDashboard;