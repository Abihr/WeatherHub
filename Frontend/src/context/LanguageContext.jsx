
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const LanguageContext = createContext(null);

export const translations = {
  // ============================================================
  // ENGLISH
  // ============================================================
  en: {
    home: "Home",
    friends: "Friends",
    map: "Map",
    weatherGPT: "WeatherGPT",
    chatbot: "Chatbot",
    alerts: "Alerts",
    agriculture: "Agriculture",
    railway: "Railway",
    settings: "Settings",
    profile: "Profile",

    // Greetings
    greeting_morning: "Good Morning",
    greeting_afternoon: "Good Afternoon",
    greeting_evening: "Good Evening",
    greeting_night: "Good Night",

    welcomeBack: "Welcome back",
    todaysWeather: "Today's Weather",
    feelsLike: "Feels Like",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    uvIndex: "UV Index",
    rainfall: "Rainfall",
    hourlyForecast: "Hourly Forecast",
    weeklyForecast: "Weekly Forecast",
    weatherAlerts: "Weather Alerts",
    noAlerts: "No alerts right now",
    quickActions: "Quick Actions",
    checkWeather: "Check Weather",
    talkToAI: "Talk to AI",
    viewMap: "View Map",
    friendsWeather: "Friends Weather",
    viewAll: "View All",

    sun: "Sun",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",

    today: "Today",
    tomorrow: "Tomorrow",
    goodMorning: "Good Morning",

    sunny: "Sunny",
    cloudy: "Cloudy",
    rainy: "Rainy",
    windy: "Windy",
    stormy: "Stormy",
    clear: "Clear",
    partlyCloudy: "Partly Cloudy",

    language: "Language",
    selectLanguage: "Select Language",
    english: "English",
    hindi: "हिंदी",
    marathi: "मराठी",
    tamil: "தமிழ்",
    telugu: "తెలుగు",
    bengali: "বাংলা",

    // ==========================================================
    // FARMER
    // ==========================================================

    farmerDashboard: "Farmer Dashboard",

    farmerSubtitle:
      "Here is your farm plan and weather outlook.",

    smartWeatherInsights:
      "Smart weather insights for your farm",

    refresh: "Refresh",
    refreshing: "Refreshing...",

    farm: "Farm",
    farmArea: "Farm Area",
    activeCrops: "Active Crops",
    live: "Live",

    weatherForecast: "Weather Forecast",

    sevenDayOutlook:
      "Seven-day weather outlook",

    phoneAlerts:
      "Phone alerts for crop risks",

    phoneAlertsDescription:
      "Get notified when new high-priority farmer alerts are detected.",

    alertsEnabled: "Alerts enabled",

    allowBrowserSettings:
      "Allow in browser settings",

    notSupported: "Not supported",

    enablePhoneAlerts:
      "Enable phone alerts",

    farmerAlerts: "Farmer Alerts",

    weatherBasedCropRisks:
      "Weather-based crop risks",

    loadingFarmerAlerts:
      "Loading farmer alerts...",

    noActiveCropRisks:
      "No active crop risks",

    favorableConditions:
      "Current weather conditions look favorable.",

    recommendedAction:
      "Recommended action:",

    fieldConditions: "Field Conditions",

    temperature: "Temperature",
    wind: "Wind",

    currentCondition:
      "Current condition",

    taskPlanner: "Task Planner",
    completed: "completed",

    cropRecommendations:
      "Crop Recommendations",

    suggestedFarmActivities:
      "Suggested farm activities",

    allCrops: "All Crops",

    yieldPrediction:
      "Yield Prediction",

    expectedYield:
      "Expected yield compared with last year",

    lastYear: "Last year",

    // ==========================================================
    // FARMER TASKS
    // ==========================================================

    irrigateCotton:
      "Irrigate cotton before 10 AM",

    inspectWheat:
      "Inspect wheat for fungal infection",

    reviewSugarcane:
      "Review sugarcane harvest timing",

    // ==========================================================
    // FARMER ACTIONS
    // ==========================================================

    sowing: "Sowing",
    harvesting: "Harvesting",
    irrigation: "Irrigation",

    monitorField: "Monitor Field",

    cropMonitoring:
      "Crop Monitoring",

    checkDrainage:
      "Check Drainage",

    diseaseMonitoring:
      "Disease Monitoring",

    next3Days:
      "Next 3 days",

    next5to7Days:
      "Next 5-7 days",

    // ==========================================================
    // FARMER MESSAGES
    // ==========================================================

    goodTimeForSowing:
      "Good time for sowing as rainfall is expected.",

    waitBeforeHarvesting:
      "Wait for 2 days. Heavy rain expected on Thursday.",

    highTemperatureIrrigate:
      "High temperature. Irrigate today before 10 AM.",

    rainfallDetected:
      "Rainfall is present. Avoid unnecessary irrigation and monitor the field for excess moisture.",

    highTemperatureDetected:
      "Temperature is relatively high. Check soil moisture and irrigate if the field is dry.",

    suitableWeather:
      "Current weather conditions are suitable. Continue regular crop monitoring.",

    heavyRainfall:
      "Heavy rainfall is detected. Check field drainage and avoid additional irrigation.",

    highTemperatureWater:
      "High temperature may increase water demand. Check soil moisture and irrigate if required.",

    currentWeatherSuitable:
      "Weather conditions are currently suitable. Continue normal crop monitoring.",

    highHumidityDisease:
      "High humidity can increase disease risk. Inspect cotton plants for fungal infections.",

    highTemperatureWaterRequirement:
      "High temperature may increase water requirements. Check soil moisture and irrigate if necessary.",

    significantRainfall:
      "Significant rainfall is present. Monitor field drainage and avoid unnecessary irrigation.",

    favorableWeather:
      "Current weather is favorable. Continue monitoring cotton growth and soil moisture.",

    higherWind:
      "Higher wind speeds are present. Monitor crops for physical damage.",

    normalMonitoring:
      "Current weather conditions look favorable. Continue normal farm monitoring.",
  },

  // ============================================================
  // HINDI
  // ============================================================
  hi: {
    home: "होम",
    friends: "मित्र",
    map: "नक्शा",
    weatherGPT: "वेदरजीपीटी",
    chatbot: "चैटबॉट",
    alerts: "चेतावनी",
    agriculture: "कृषि",
    railway: "रेलवे",
    settings: "सेटिंग्स",
    profile: "प्रोफ़ाइल",

    // Greetings
    greeting_morning: "सुप्रभात",
    greeting_afternoon: "शुभ दोपहर",
    greeting_evening: "शुभ संध्या",
    greeting_night: "शुभ रात्रि",

    welcomeBack: "वापसी पर स्वागत है",
    todaysWeather: "आज का मौसम",
    feelsLike: "महसूस होता है",
    humidity: "नमी",
    windSpeed: "हवा की गति",
    uvIndex: "यूवी इंडेक्स",
    rainfall: "बारिश",
    hourlyForecast: "घंटेवार पूर्वानुमान",
    weeklyForecast: "साप्ताहिक पूर्वानुमान",
    weatherAlerts: "मौसम चेतावनी",
    noAlerts: "अभी कोई चेतावनी नहीं",
    quickActions: "त्वरित कार्य",
    checkWeather: "मौसम देखें",
    talkToAI: "AI से बात करें",
    viewMap: "नक्शा देखें",
    friendsWeather: "मित्रों का मौसम",
    viewAll: "सभी देखें",

    sun: "रवि",
    mon: "सोम",
    tue: "मंगल",
    wed: "बुध",
    thu: "गुरु",
    fri: "शुक्र",
    sat: "शनि",

    today: "आज",
    tomorrow: "कल",
    goodMorning: "सुप्रभात",

    sunny: "धूप",
    cloudy: "बादल",
    rainy: "बारिश",
    windy: "हवा",
    stormy: "तूफान",
    clear: "साफ",
    partlyCloudy: "कुछ बादल",

    language: "भाषा",
    selectLanguage: "भाषा चुनें",

    english: "English",
    hindi: "हिंदी",
    marathi: "मराठी",
    tamil: "தமிழ்",
    telugu: "తెలుగు",
    bengali: "বাংলা",

    // Farmer
    farmerDashboard: "किसान डैशबोर्ड",

    farmerSubtitle:
      "यहाँ आपके खेत की योजना और मौसम का पूर्वानुमान है।",

    smartWeatherInsights:
      "आपके खेत के लिए स्मार्ट मौसम जानकारी",

    refresh: "रिफ्रेश",
    refreshing: "रिफ्रेश हो रहा है...",

    farm: "खेत",
    farmArea: "खेत का क्षेत्रफल",
    activeCrops: "सक्रिय फसलें",
    live: "लाइव",

    weatherForecast: "मौसम पूर्वानुमान",

    sevenDayOutlook:
      "सात दिनों का मौसम पूर्वानुमान",

    phoneAlerts:
      "फसल जोखिम के लिए फोन अलर्ट",

    phoneAlertsDescription:
      "नई महत्वपूर्ण किसान चेतावनियों की सूचना प्राप्त करें।",

    alertsEnabled: "अलर्ट चालू हैं",

    allowBrowserSettings:
      "ब्राउज़र सेटिंग्स में अनुमति दें",

    notSupported: "समर्थित नहीं",

    enablePhoneAlerts:
      "फोन अलर्ट चालू करें",

    farmerAlerts:
      "किसान चेतावनियाँ",

    weatherBasedCropRisks:
      "मौसम आधारित फसल जोखिम",

    loadingFarmerAlerts:
      "किसान चेतावनियाँ लोड हो रही हैं...",

    noActiveCropRisks:
      "कोई सक्रिय फसल जोखिम नहीं",

    favorableConditions:
      "वर्तमान मौसम की स्थिति अनुकूल है।",

    recommendedAction:
      "अनुशंसित कार्रवाई:",

    fieldConditions:
      "खेत की स्थिति",

    temperature: "तापमान",
    wind: "हवा",

    currentCondition:
      "वर्तमान स्थिति",

    taskPlanner:
      "कार्य योजना",

    completed: "पूर्ण",

    cropRecommendations:
      "फसल सुझाव",

    suggestedFarmActivities:
      "सुझाई गई कृषि गतिविधियाँ",

    allCrops:
      "सभी फसलें",

    yieldPrediction:
      "उपज का अनुमान",

    expectedYield:
      "पिछले वर्ष की तुलना में अपेक्षित उपज",

    lastYear:
      "पिछला वर्ष",

    sowing: "बुवाई",
    harvesting: "कटाई",
    irrigation: "सिंचाई",

    monitorField:
      "खेत की निगरानी",

    cropMonitoring:
      "फसल की निगरानी",

    checkDrainage:
      "जल निकासी जाँचें",

    diseaseMonitoring:
      "रोग की निगरानी",

    next3Days:
      "अगले 3 दिन",

    next5to7Days:
      "अगले 5-7 दिन",

    irrigateCotton:
      "सुबह 10 बजे से पहले कपास की सिंचाई करें",

    inspectWheat:
      "गेहूँ में फंगल संक्रमण की जाँच करें",

    reviewSugarcane:
      "गन्ने की कटाई का समय जाँचें",

    goodTimeForSowing:
      "बारिश की संभावना के कारण बुवाई के लिए अच्छा समय है।",

    waitBeforeHarvesting:
      "2 दिन प्रतीक्षा करें। गुरुवार को भारी बारिश की संभावना है।",

    highTemperatureIrrigate:
      "तापमान अधिक है। आज सुबह 10 बजे से पहले सिंचाई करें।",

    rainfallDetected:
      "बारिश हो रही है। अनावश्यक सिंचाई से बचें और खेत में अधिक नमी की निगरानी करें।",

    highTemperatureDetected:
      "तापमान अपेक्षाकृत अधिक है। मिट्टी की नमी जाँचें।",

    suitableWeather:
      "वर्तमान मौसम की स्थिति अनुकूल है। नियमित फसल निगरानी जारी रखें।",

    heavyRainfall:
      "भारी बारिश की संभावना है। खेत की जल निकासी जाँचें।",

    highTemperatureWater:
      "अधिक तापमान से पानी की आवश्यकता बढ़ सकती है।",

    currentWeatherSuitable:
      "मौसम की स्थिति अभी अनुकूल है।",

    highHumidityDisease:
      "अधिक नमी से रोग का खतरा बढ़ सकता है।",

    highTemperatureWaterRequirement:
      "अधिक तापमान से पानी की आवश्यकता बढ़ सकती है।",

    significantRainfall:
      "महत्वपूर्ण वर्षा हो रही है। खेत की जल निकासी की निगरानी करें।",

    favorableWeather:
      "वर्तमान मौसम अनुकूल है। कपास की वृद्धि और मिट्टी की नमी की निगरानी करें।",

    higherWind:
      "हवा की गति अधिक है। फसलों को नुकसान की निगरानी करें।",

    normalMonitoring:
      "वर्तमान मौसम अनुकूल है। सामान्य खेत निगरानी जारी रखें।",
  },

  // ============================================================
  // MARATHI
  // ============================================================
  mr: {
    home: "मुख्यपृष्ठ",
    friends: "मित्र",
    map: "नकाशा",
    weatherGPT: "वेदरजीपीटी",
    chatbot: "चॅटबॉट",
    alerts: "सूचना",
    agriculture: "शेती",
    railway: "रेल्वे",
    settings: "सेटिंग्ज",
    profile: "प्रोफाइल",

    // Greetings
    greeting_morning: "सुप्रभात",
    greeting_afternoon: "शुभ दुपार",
    greeting_evening: "शुभ संध्याकाळ",
    greeting_night: "शुभ रात्री",

    welcomeBack: "पुन्हा स्वागत",
    todaysWeather: "आजचे हवामान",
    feelsLike: "जाणवते",
    humidity: "आर्द्रता",
    windSpeed: "वाऱ्याचा वेग",
    uvIndex: "यूव्ही इंडेक्स",
    rainfall: "पाऊस",
    hourlyForecast: "तासानुसार अंदाज",
    weeklyForecast: "साप्ताहिक अंदाज",
    weatherAlerts: "हवामान सूचना",
    noAlerts: "सध्या कोणतीही सूचना नाही",
    quickActions: "त्वरित क्रिया",
    checkWeather: "हवामान पहा",
    talkToAI: "AI शी बोला",
    viewMap: "नकाशा पहा",
    friendsWeather: "मित्रांचे हवामान",
    viewAll: "सर्व पहा",

    sun: "रवि",
    mon: "सोम",
    tue: "मंगळ",
    wed: "बुध",
    thu: "गुरु",
    fri: "शुक्र",
    sat: "शनि",

    today: "आज",
    tomorrow: "उद्या",
    goodMorning: "सुप्रभात",

    sunny: "ऊन",
    cloudy: "ढगाळ",
    rainy: "पाऊस",
    windy: "वारा",
    stormy: "वादळ",
    clear: "स्वच्छ",
    partlyCloudy: "अंशतः ढगाळ",

    language: "भाषा",
    selectLanguage: "भाषा निवडा",

    english: "English",
    hindi: "हिंदी",
    marathi: "मराठी",
    tamil: "தமிழ்",
    telugu: "తెలుగు",
    bengali: "বাংলা",

    // Farmer
    farmerDashboard: "शेतकरी डॅशबोर्ड",

    farmerSubtitle:
      "तुमच्या शेताची योजना आणि हवामानाचा अंदाज येथे आहे.",

    smartWeatherInsights:
      "तुमच्या शेतासाठी स्मार्ट हवामान माहिती",

    refresh: "रिफ्रेश",
    refreshing: "रिफ्रेश होत आहे...",

    farm: "शेत",
    farmArea: "शेताचे क्षेत्रफळ",
    activeCrops: "सक्रिय पिके",
    live: "लाइव्ह",

    weatherForecast:
      "हवामान अंदाज",

    sevenDayOutlook:
      "सात दिवसांचा हवामान अंदाज",

    phoneAlerts:
      "पिकांच्या जोखमीसाठी फोन सूचना",

    phoneAlertsDescription:
      "महत्त्वाच्या शेतकरी सूचनांसाठी सूचना मिळवा.",

    alertsEnabled:
      "सूचना सुरू आहेत",

    allowBrowserSettings:
      "ब्राउझर सेटिंग्जमध्ये परवानगी द्या",

    notSupported:
      "समर्थित नाही",

    enablePhoneAlerts:
      "फोन सूचना सुरू करा",

    farmerAlerts:
      "शेतकरी सूचना",

    weatherBasedCropRisks:
      "हवामानावर आधारित पिकांचे धोके",

    loadingFarmerAlerts:
      "शेतकरी सूचना लोड होत आहेत...",

    noActiveCropRisks:
      "सध्या पिकांना कोणताही सक्रिय धोका नाही",

    favorableConditions:
      "सध्याचे हवामान अनुकूल आहे.",

    recommendedAction:
      "शिफारस केलेली कृती:",

    fieldConditions:
      "शेताची स्थिती",

    temperature:
      "तापमान",

    wind:
      "वारा",

    currentCondition:
      "सध्याची स्थिती",

    taskPlanner:
      "कामाचे नियोजन",

    completed:
      "पूर्ण",

    cropRecommendations:
      "पिकांसाठी शिफारसी",

    suggestedFarmActivities:
      "सुचवलेल्या शेतीच्या क्रिया",

    allCrops:
      "सर्व पिके",

    yieldPrediction:
      "उत्पादन अंदाज",

    expectedYield:
      "मागील वर्षाच्या तुलनेत अपेक्षित उत्पादन",

    lastYear:
      "मागील वर्ष",

    sowing: "पेरणी",
    harvesting: "कापणी",
    irrigation: "सिंचन",

    monitorField:
      "शेताची निगराणी",

    cropMonitoring:
      "पिकांची निगराणी",

    checkDrainage:
      "पाण्याचा निचरा तपासा",

    diseaseMonitoring:
      "रोगाची निगराणी",

    next3Days:
      "पुढील 3 दिवस",

    next5to7Days:
      "पुढील 5-7 दिवस",

    irrigateCotton:
      "सकाळी 10 वाजण्यापूर्वी कापसाला पाणी द्या",

    inspectWheat:
      "गव्हामध्ये बुरशीजन्य संसर्ग तपासा",

    reviewSugarcane:
      "ऊस कापणीची वेळ तपासा",

    goodTimeForSowing:
      "पावसाची शक्यता असल्याने पेरणीसाठी चांगला काळ आहे.",

    waitBeforeHarvesting:
      "2 दिवस थांबा. गुरुवारी मुसळधार पावसाची शक्यता आहे.",

    highTemperatureIrrigate:
      "तापमान जास्त आहे. सकाळी 10 वाजण्यापूर्वी सिंचन करा.",

    rainfallDetected:
      "पाऊस आहे. अनावश्यक सिंचन टाळा आणि जमिनीतील ओलावा तपासा.",

    highTemperatureDetected:
      "तापमान तुलनेने जास्त आहे. जमिनीतील ओलावा तपासा.",

    suitableWeather:
      "सध्याचे हवामान अनुकूल आहे. नियमित पिकांची निगराणी सुरू ठेवा.",

    heavyRainfall:
      "मुसळधार पावसाची शक्यता आहे. शेतातील पाण्याचा निचरा तपासा.",

    highTemperatureWater:
      "जास्त तापमानामुळे पाण्याची गरज वाढू शकते.",

    currentWeatherSuitable:
      "सध्याचे हवामान अनुकूल आहे.",

    highHumidityDisease:
      "जास्त आर्द्रतेमुळे रोगाचा धोका वाढू शकतो.",

    highTemperatureWaterRequirement:
      "जास्त तापमानामुळे पाण्याची गरज वाढू शकते.",

    significantRainfall:
      "लक्षणीय पाऊस होत आहे. शेतातील निचऱ्याची निगराणी करा.",

    favorableWeather:
      "सध्याचे हवामान अनुकूल आहे. कापसाची वाढ आणि जमिनीतील ओलावा तपासा.",

    higherWind:
      "वाऱ्याचा वेग जास्त आहे. पिकांचे नुकसान तपासा.",

    normalMonitoring:
      "सध्याचे हवामान अनुकूल आहे. सामान्य शेत निगराणी सुरू ठेवा.",
  },

  // ============================================================
  // TAMIL
  // ============================================================
  ta: {
    home: "முகப்பு",
    friends: "நண்பர்கள்",
    map: "வரைபடம்",
    weatherGPT: "வெதர்ஜிபிடி",
    chatbot: "சாட்பாட்",
    alerts: "எச்சரிக்கைகள்",
    agriculture: "விவசாயம்",
    railway: "ரயில்வே",
    settings: "அமைப்புகள்",
    profile: "சுயவிவரம்",

    // Greetings
    greeting_morning: "காலை வணக்கம்",
    greeting_afternoon: "மதிய வணக்கம்",
    greeting_evening: "மாலை வணக்கம்",
    greeting_night: "இரவு வணக்கம்",

    welcomeBack: "மீண்டும் வருக",
    todaysWeather: "இன்றைய வானிலை",
    feelsLike: "உணரப்படுகிறது",
    humidity: "ஈரப்பதம்",
    windSpeed: "காற்றின் வேகம்",
    uvIndex: "UV குறியீடு",
    rainfall: "மழை",
    hourlyForecast: "மணிநேர முன்னறிவிப்பு",
    weeklyForecast: "வாராந்திர முன்னறிவிப்பு",
    weatherAlerts: "வானிலை எச்சரிக்கைகள்",
    noAlerts: "இப்போது எச்சரிக்கைகள் இல்லை",
    quickActions: "விரைவு செயல்கள்",
    checkWeather: "வானிலை பார்க்க",
    talkToAI: "AI உடன் பேசு",
    viewMap: "வரைபடம் பார்",
    friendsWeather: "நண்பர்களின் வானிலை",
    viewAll: "அனைத்தையும் பார்",

    sun: "ஞாயிறு",
    mon: "திங்கள்",
    tue: "செவ்வாய்",
    wed: "புதன்",
    thu: "வியாழன்",
    fri: "வெள்ளி",
    sat: "சனி",

    today: "இன்று",
    tomorrow: "நாளை",
    goodMorning: "காலை வணக்கம்",

    sunny: "வெயில்",
    cloudy: "மேகமூட்டம்",
    rainy: "மழை",
    windy: "காற்று",
    stormy: "புயல்",
    clear: "தெளிவு",
    partlyCloudy: "பகுதி மேகமூட்டம்",

    language: "மொழி",
    selectLanguage: "மொழியை தேர்வு செய்",

    english: "English",
    hindi: "हिंदी",
    marathi: "मराठी",
    tamil: "தமிழ்",
    telugu: "తెలుగు",
    bengali: "বাংলা",

    // Farmer
    farmerDashboard:
      "விவசாயி டாஷ்போர்டு",

    farmerSubtitle:
      "உங்கள் பண்ணைத் திட்டம் மற்றும் வானிலை முன்னறிவிப்பு இங்கே உள்ளது.",

    smartWeatherInsights:
      "உங்கள் பண்ணைக்கான ஸ்மார்ட் வானிலை தகவல்கள்",

    refresh: "புதுப்பிக்கவும்",
    refreshing: "புதுப்பிக்கப்படுகிறது...",

    farm: "பண்ணை",
    farmArea: "பண்ணை பரப்பளவு",
    activeCrops: "செயலில் உள்ள பயிர்கள்",
    live: "நேரலை",

    weatherForecast:
      "வானிலை முன்னறிவிப்பு",

    sevenDayOutlook:
      "ஏழு நாள் வானிலை முன்னறிவிப்பு",

    phoneAlerts:
      "பயிர் அபாயங்களுக்கான தொலைபேசி எச்சரிக்கைகள்",

    phoneAlertsDescription:
      "முக்கியமான விவசாயி எச்சரிக்கைகளுக்கான அறிவிப்புகளைப் பெறுங்கள்.",

    alertsEnabled:
      "எச்சரிக்கைகள் இயக்கப்பட்டுள்ளன",

    allowBrowserSettings:
      "உலாவி அமைப்புகளில் அனுமதிக்கவும்",

    notSupported:
      "ஆதரிக்கப்படவில்லை",

    enablePhoneAlerts:
      "தொலைபேசி எச்சரிக்கைகளை இயக்கவும்",

    farmerAlerts:
      "விவசாயி எச்சரிக்கைகள்",

    weatherBasedCropRisks:
      "வானிலை அடிப்படையிலான பயிர் அபாயங்கள்",

    loadingFarmerAlerts:
      "விவசாயி எச்சரிக்கைகள் ஏற்றப்படுகின்றன...",

    noActiveCropRisks:
      "செயலில் உள்ள பயிர் அபாயங்கள் இல்லை",

    favorableConditions:
      "தற்போதைய வானிலை நிலை சாதகமாக உள்ளது.",

    recommendedAction:
      "பரிந்துரைக்கப்பட்ட நடவடிக்கை:",

    fieldConditions:
      "வயல் நிலை",

    temperature:
      "வெப்பநிலை",

    wind:
      "காற்று",

    currentCondition:
      "தற்போதைய நிலை",

    taskPlanner:
      "பணி திட்டமிடல்",

    completed:
      "முடிந்தது",

    cropRecommendations:
      "பயிர் பரிந்துரைகள்",

    suggestedFarmActivities:
      "பரிந்துரைக்கப்பட்ட விவசாய நடவடிக்கைகள்",

    allCrops:
      "அனைத்து பயிர்கள்",

    yieldPrediction:
      "விளைச்சல் கணிப்பு",

    expectedYield:
      "கடந்த ஆண்டுடன் ஒப்பிடுகையில் எதிர்பார்க்கப்படும் விளைச்சல்",

    lastYear:
      "கடந்த ஆண்டு",

    sowing: "விதைத்தல்",
    harvesting: "அறுவடை",
    irrigation: "நீர்ப்பாசனம்",

    monitorField:
      "வயலை கண்காணிக்கவும்",

    cropMonitoring:
      "பயிர் கண்காணிப்பு",

    checkDrainage:
      "வடிகால் சரிபார்க்கவும்",

    diseaseMonitoring:
      "நோய் கண்காணிப்பு",

    next3Days:
      "அடுத்த 3 நாட்கள்",

    next5to7Days:
      "அடுத்த 5-7 நாட்கள்",

    irrigateCotton:
      "காலை 10 மணிக்கு முன் பருத்திக்கு நீர் பாய்ச்சவும்",

    inspectWheat:
      "கோதுமையில் பூஞ்சை தொற்று உள்ளதா என சரிபார்க்கவும்",

    reviewSugarcane:
      "கரும்பு அறுவடை நேரத்தை சரிபார்க்கவும்",

    goodTimeForSowing:
      "மழை எதிர்பார்க்கப்படுவதால் விதைப்பதற்கு நல்ல நேரம்.",

    waitBeforeHarvesting:
      "2 நாட்கள் காத்திருக்கவும். வியாழக்கிழமை கனமழை எதிர்பார்க்கப்படுகிறது.",

    highTemperatureIrrigate:
      "வெப்பநிலை அதிகமாக உள்ளது. காலை 10 மணிக்கு முன் நீர்ப்பாசனம் செய்யவும்.",

    rainfallDetected:
      "மழை உள்ளது. தேவையற்ற நீர்ப்பாசனத்தைத் தவிர்த்து வயலில் அதிக ஈரப்பதத்தை கண்காணிக்கவும்.",

    highTemperatureDetected:
      "வெப்பநிலை அதிகமாக உள்ளது. மண் ஈரப்பதத்தை சரிபார்க்கவும்.",

    suitableWeather:
      "தற்போதைய வானிலை சாதகமாக உள்ளது. வழக்கமான பயிர் கண்காணிப்பைத் தொடரவும்.",

    heavyRainfall:
      "கனமழை எதிர்பார்க்கப்படுகிறது. வயல் வடிகால்களை சரிபார்க்கவும்.",

    highTemperatureWater:
      "அதிக வெப்பநிலை நீர் தேவையை அதிகரிக்கலாம்.",

    currentWeatherSuitable:
      "தற்போதைய வானிலை சாதகமாக உள்ளது.",

    highHumidityDisease:
      "அதிக ஈரப்பதம் நோய் அபாயத்தை அதிகரிக்கலாம்.",

    highTemperatureWaterRequirement:
      "அதிக வெப்பநிலை நீர் தேவையை அதிகரிக்கலாம்.",

    significantRainfall:
      "குறிப்பிடத்தக்க மழை பெய்கிறது. வயல் வடிகால்களை கண்காணிக்கவும்.",

    favorableWeather:
      "தற்போதைய வானிலை சாதகமாக உள்ளது. பருத்தி வளர்ச்சி மற்றும் மண் ஈரப்பதத்தை கண்காணிக்கவும்.",

    higherWind:
      "காற்றின் வேகம் அதிகமாக உள்ளது. பயிர்களுக்கு ஏற்படும் சேதத்தை கண்காணிக்கவும்.",

    normalMonitoring:
      "தற்போதைய வானிலை சாதகமாக உள்ளது. வழக்கமான பண்ணை கண்காணிப்பைத் தொடரவும்.",
  },

  // ============================================================
  // TELUGU
  // ============================================================
  te: {
    home: "హోమ్",
    friends: "స్నేహితులు",
    map: "మ్యాప్",
    weatherGPT: "వెదర్జిపిటి",
    chatbot: "చాట్‌బాట్",
    alerts: "హెచ్చరికలు",
    agriculture: "వ్యవసాయం",
    railway: "రైల్వే",
    settings: "సెట్టింగ్‌లు",
    profile: "ప్రొఫైల్",

    // Greetings
    greeting_morning: "శుభోదయం",
    greeting_afternoon: "శుభ మధ్యాహ్నం",
    greeting_evening: "శుభ సాయంత్రం",
    greeting_night: "శుభ రాత్రి",

    welcomeBack: "తిరిగి స్వాగతం",
    todaysWeather: "నేటి వాతావరణం",
    feelsLike: "అనిపిస్తుంది",
    humidity: "తేమ",
    windSpeed: "గాలి వేగం",
    uvIndex: "UV సూచిక",
    rainfall: "వర్షం",
    hourlyForecast: "గంటవారీ సూచన",
    weeklyForecast: "వారపు సూచన",
    weatherAlerts: "వాతావరణ హెచ్చరికలు",
    noAlerts: "ఇప్పుడు హెచ్చరికలు లేవు",
    quickActions: "త్వరిత చర్యలు",
    checkWeather: "వాతావరణం చూడండి",
    talkToAI: "AI తో మాట్లాడండి",
    viewMap: "మ్యాప్ చూడండి",
    friendsWeather: "స్నేహితుల వాతావరణం",
    viewAll: "అన్నీ చూడండి",

    sun: "ఆది",
    mon: "సోమ",
    tue: "మంగళ",
    wed: "బుధ",
    thu: "గురు",
    fri: "శుక్ర",
    sat: "శని",

    today: "నేడు",
    tomorrow: "రేపు",
    goodMorning: "శుభోదయం",

    sunny: "ఎండ",
    cloudy: "మేఘావృతం",
    rainy: "వర్షం",
    windy: "గాలి",
    stormy: "తుఫాను",
    clear: "స్పష్టం",
    partlyCloudy: "పాక్షికంగా మేఘావృతం",

    language: "భాష",
    selectLanguage: "భాషను ఎంచుకోండి",

    english: "English",
    hindi: "हिंदी",
    marathi: "मराठी",
    tamil: "தமிழ்",
    telugu: "తెలుగు",
    bengali: "বাংলা",

    // Farmer
    farmerDashboard:
      "రైతు డ్యాష్‌బోర్డ్",

    farmerSubtitle:
      "మీ పొలం ప్రణాళిక మరియు వాతావరణ సూచన ఇక్కడ ఉన్నాయి.",

    smartWeatherInsights:
      "మీ పొలానికి స్మార్ట్ వాతావరణ సమాచారం",

    refresh: "రిఫ్రెష్",
    refreshing: "రిఫ్రెష్ అవుతోంది...",

    farm: "పొలం",
    farmArea: "పొలం విస్తీర్ణం",
    activeCrops: "క్రియాశీల పంటలు",
    live: "లైవ్",

    weatherForecast:
      "వాతావరణ సూచన",

    sevenDayOutlook:
      "ఏడు రోజుల వాతావరణ సూచన",

    phoneAlerts:
      "పంట ప్రమాదాల కోసం ఫోన్ హెచ్చరికలు",

    phoneAlertsDescription:
      "ముఖ్యమైన రైతు హెచ్చరికల గురించి నోటిఫికేషన్లు పొందండి.",

    alertsEnabled:
      "హెచ్చరికలు ప్రారంభించబడ్డాయి",

    allowBrowserSettings:
      "బ్రౌజర్ సెట్టింగ్‌లలో అనుమతించండి",

    notSupported:
      "మద్దతు లేదు",

    enablePhoneAlerts:
      "ఫోన్ హెచ్చరికలను ప్రారంభించండి",

    farmerAlerts:
      "రైతు హెచ్చరికలు",

    weatherBasedCropRisks:
      "వాతావరణ ఆధారిత పంట ప్రమాదాలు",

    loadingFarmerAlerts:
      "రైతు హెచ్చరికలు లోడ్ అవుతున్నాయి...",

    noActiveCropRisks:
      "క్రియాశీల పంట ప్రమాదాలు లేవు",

    favorableConditions:
      "ప్రస్తుత వాతావరణ పరిస్థితులు అనుకూలంగా ఉన్నాయి.",

    recommendedAction:
      "సిఫార్సు చేసిన చర్య:",

    fieldConditions:
      "పొలం పరిస్థితులు",

    temperature:
      "ఉష్ణోగ్రత",

    wind:
      "గాలి",

    currentCondition:
      "ప్రస్తుత పరిస్థితి",

    taskPlanner:
      "పని ప్రణాళిక",

    completed:
      "పూర్తయింది",

    cropRecommendations:
      "పంట సిఫార్సులు",

    suggestedFarmActivities:
      "సూచించిన వ్యవసాయ కార్యకలాపాలు",

    allCrops:
      "అన్ని పంటలు",

    yieldPrediction:
      "దిగుబడి అంచనా",

    expectedYield:
      "గత సంవత్సరంతో పోలిస్తే అంచనా దిగుబడి",

    lastYear:
      "గత సంవత్సరం",

    sowing: "విత్తడం",
    harvesting: "కోత",
    irrigation: "నీటిపారుదల",

    monitorField:
      "పొలాన్ని పర్యవేక్షించండి",

    cropMonitoring:
      "పంట పర్యవేక్షణ",

    checkDrainage:
      "నీటి పారుదల తనిఖీ",

    diseaseMonitoring:
      "వ్యాధి పర్యవేక్షణ",

    next3Days:
      "తదుపరి 3 రోజులు",

    next5to7Days:
      "తదుపరి 5-7 రోజులు",

    irrigateCotton:
      "ఉదయం 10 గంటలలోపు పత్తికి నీరు పెట్టండి",

    inspectWheat:
      "గోధుమలో ఫంగల్ ఇన్ఫెక్షన్ కోసం తనిఖీ చేయండి",

    reviewSugarcane:
      "చెరకు కోత సమయాన్ని పరిశీలించండి",

    goodTimeForSowing:
      "వర్షం వచ్చే అవకాశం ఉన్నందున విత్తడానికి మంచి సమయం.",

    waitBeforeHarvesting:
      "2 రోజులు వేచి ఉండండి. గురువారం భారీ వర్షం వచ్చే అవకాశం ఉంది.",

    highTemperatureIrrigate:
      "ఉష్ణోగ్రత ఎక్కువగా ఉంది. ఉదయం 10 గంటలలోపు నీటిపారుదల చేయండి.",

    rainfallDetected:
      "వర్షపాతం ఉంది. అనవసర నీటిపారుదల నివారించండి.",

    highTemperatureDetected:
      "ఉష్ణోగ్రత ఎక్కువగా ఉంది. నేల తేమను తనిఖీ చేయండి.",

    suitableWeather:
      "ప్రస్తుత వాతావరణ పరిస్థితులు అనుకూలంగా ఉన్నాయి.",

    heavyRainfall:
      "భారీ వర్షం వచ్చే అవకాశం ఉంది. పొలం డ్రైనేజీని తనిఖీ చేయండి.",

    highTemperatureWater:
      "అధిక ఉష్ణోగ్రత నీటి అవసరాన్ని పెంచవచ్చు.",

    currentWeatherSuitable:
      "ప్రస్తుత వాతావరణం అనుకూలంగా ఉంది.",

    highHumidityDisease:
      "అధిక తేమ వ్యాధి ప్రమాదాన్ని పెంచవచ్చు.",

    highTemperatureWaterRequirement:
      "అధిక ఉష్ణోగ్రత నీటి అవసరాన్ని పెంచవచ్చు.",

    significantRainfall:
      "గణనీయమైన వర్షపాతం ఉంది. పొలం డ్రైనేజీని పర్యవేక్షించండి.",

    favorableWeather:
      "ప్రస్తుత వాతావరణం అనుకూలంగా ఉంది. పత్తి పెరుగుదల మరియు నేల తేమను పర్యవేక్షించండి.",

    higherWind:
      "గాలి వేగం ఎక్కువగా ఉంది. పంటలకు నష్టం ఉందో లేదో పర్యవేక్షించండి.",

    normalMonitoring:
      "ప్రస్తుత వాతావరణం అనుకూలంగా ఉంది. సాధారణ వ్యవసాయ పర్యవేక్షణ కొనసాగించండి.",
  },

  // ============================================================
  // BENGALI
  // ============================================================
  bn: {
    home: "হোম",
    friends: "বন্ধুরা",
    map: "মানচিত্র",
    weatherGPT: "ওয়েদারজিপিটি",
    chatbot: "চ্যাটবট",
    alerts: "সতর্কতা",
    agriculture: "কৃষি",
    railway: "রেলওয়ে",
    settings: "সেটিংস",
    profile: "প্রোফাইল",

    // Greetings
    greeting_morning: "সুপ্রভাত",
    greeting_afternoon: "শুভ অপরাহ্ন",
    greeting_evening: "শুভ সন্ধ্যা",
    greeting_night: "শুভ রাত্রি",

    welcomeBack: "স্বাগতম",
    todaysWeather: "আজকের আবহাওয়া",
    feelsLike: "অনুভূত হয়",
    humidity: "আর্দ্রতা",
    windSpeed: "বাতাসের গতি",
    uvIndex: "UV সূচক",
    rainfall: "বৃষ্টি",
    hourlyForecast: "ঘণ্টাভিত্তিক পূর্বাভাস",
    weeklyForecast: "সাপ্তাহিক পূর্বাভাস",
    weatherAlerts: "আবহাওয়া সতর্কতা",
    noAlerts: "এখন কোনো সতর্কতা নেই",
    quickActions: "দ্রুত কাজ",
    checkWeather: "আবহাওয়া দেখুন",
    talkToAI: "AI এর সাথে কথা বলুন",
    viewMap: "মানচিত্র দেখুন",
    friendsWeather: "বন্ধুদের আবহাওয়া",
    viewAll: "সব দেখুন",

    sun: "রবি",
    mon: "সোম",
    tue: "মঙ্গল",
    wed: "বুধ",
    thu: "বৃহস্পতি",
    fri: "শুক্র",
    sat: "শনি",

    today: "আজ",
    tomorrow: "আগামীকাল",
    goodMorning: "সুপ্রভাত",

    sunny: "রোদ",
    cloudy: "মেঘলা",
    rainy: "বৃষ্টি",
    windy: "বাতাস",
    stormy: "ঝড়",
    clear: "পরিষ্কার",
    partlyCloudy: "আংশিক মেঘলা",

    language: "ভাষা",
    selectLanguage: "ভাষা নির্বাচন করুন",

    english: "English",
    hindi: "हिंदी",
    marathi: "मराठी",
    tamil: "தமிழ்",
    telugu: "తెలుగు",
    bengali: "বাংলা",

    // Farmer
    farmerDashboard:
      "কৃষক ড্যাশবোর্ড",

    farmerSubtitle:
      "আপনার খামারের পরিকল্পনা এবং আবহাওয়ার পূর্বাভাস এখানে রয়েছে।",

    smartWeatherInsights:
      "আপনার খামারের জন্য স্মার্ট আবহাওয়ার তথ্য",

    refresh: "রিফ্রেশ",
    refreshing: "রিফ্রেশ হচ্ছে...",

    farm: "খামার",
    farmArea: "খামারের এলাকা",
    activeCrops: "সক্রিয় ফসল",
    live: "লাইভ",

    weatherForecast:
      "আবহাওয়ার পূর্বাভাস",

    sevenDayOutlook:
      "সাত দিনের আবহাওয়ার পূর্বাভাস",

    phoneAlerts:
      "ফসলের ঝুঁকির জন্য ফোন সতর্কতা",

    phoneAlertsDescription:
      "গুরুত্বপূর্ণ কৃষক সতর্কতার জন্য বিজ্ঞপ্তি পান।",

    alertsEnabled:
      "সতর্কতা চালু হয়েছে",

    allowBrowserSettings:
      "ব্রাউজার সেটিংসে অনুমতি দিন",

    notSupported:
      "সমর্থিত নয়",

    enablePhoneAlerts:
      "ফোন সতর্কতা চালু করুন",

    farmerAlerts:
      "কৃষক সতর্কতা",

    weatherBasedCropRisks:
      "আবহাওয়া ভিত্তিক ফসলের ঝুঁকি",

    loadingFarmerAlerts:
      "কৃষক সতর্কতা লোড হচ্ছে...",

    noActiveCropRisks:
      "কোনো সক্রিয় ফসলের ঝুঁকি নেই",

    favorableConditions:
      "বর্তমান আবহাওয়ার পরিস্থিতি অনুকূল।",

    recommendedAction:
      "প্রস্তাবিত পদক্ষেপ:",

    fieldConditions:
      "জমির অবস্থা",

    temperature:
      "তাপমাত্রা",

    wind:
      "বাতাস",

    currentCondition:
      "বর্তমান অবস্থা",

    taskPlanner:
      "কাজের পরিকল্পনা",

    completed:
      "সম্পন্ন",

    cropRecommendations:
      "ফসলের সুপারিশ",

    suggestedFarmActivities:
      "প্রস্তাবিত কৃষি কার্যক্রম",

    allCrops:
      "সব ফসল",

    yieldPrediction:
      "ফলন পূর্বাভাস",

    expectedYield:
      "গত বছরের তুলনায় প্রত্যাশিত ফলন",

    lastYear:
      "গত বছর",

    sowing: "বপন",
    harvesting: "ফসল কাটা",
    irrigation: "সেচ",

    monitorField:
      "জমি পর্যবেক্ষণ",

    cropMonitoring:
      "ফসল পর্যবেক্ষণ",

    checkDrainage:
      "জল নিষ্কাশন পরীক্ষা করুন",

    diseaseMonitoring:
      "রোগ পর্যবেক্ষণ",

    next3Days:
      "পরবর্তী ৩ দিন",

    next5to7Days:
      "পরবর্তী ৫-৭ দিন",

    irrigateCotton:
      "সকাল ১০টার আগে তুলায় সেচ দিন",

    inspectWheat:
      "গমে ছত্রাক সংক্রমণ পরীক্ষা করুন",

    reviewSugarcane:
      "আখ কাটার সময় পর্যালোচনা করুন",

    goodTimeForSowing:
      "বৃষ্টির সম্ভাবনা থাকায় বপনের জন্য ভালো সময়।",

    waitBeforeHarvesting:
      "২ দিন অপেক্ষা করুন। বৃহস্পতিবার ভারী বৃষ্টির সম্ভাবনা রয়েছে।",

    highTemperatureIrrigate:
      "তাপমাত্রা বেশি। সকাল ১০টার আগে সেচ দিন।",

    rainfallDetected:
      "বৃষ্টিপাত হচ্ছে। অপ্রয়োজনীয় সেচ এড়িয়ে চলুন।",

    highTemperatureDetected:
      "তাপমাত্রা তুলনামূলক বেশি। মাটির আর্দ্রতা পরীক্ষা করুন।",

    suitableWeather:
      "বর্তমান আবহাওয়া অনুকূল। নিয়মিত ফসল পর্যবেক্ষণ চালিয়ে যান।",

    heavyRainfall:
      "ভারী বৃষ্টির সম্ভাবনা রয়েছে। জমির জল নিষ্কাশন পরীক্ষা করুন।",

    highTemperatureWater:
      "উচ্চ তাপমাত্রায় পানির প্রয়োজন বাড়তে পারে।",

    currentWeatherSuitable:
      "বর্তমান আবহাওয়া অনুকূল।",

    highHumidityDisease:
      "উচ্চ আর্দ্রতা রোগের ঝুঁকি বাড়াতে পারে।",

    highTemperatureWaterRequirement:
      "উচ্চ তাপমাত্রায় পানির প্রয়োজন বাড়তে পারে।",

    significantRainfall:
      "উল্লেখযোগ্য বৃষ্টিপাত হচ্ছে। জমির জল নিষ্কাশন পর্যবেক্ষণ করুন।",

    favorableWeather:
      "বর্তমান আবহাওয়া অনুকূল। তুলার বৃদ্ধি ও মাটির আর্দ্রতা পর্যবেক্ষণ করুন।",

    higherWind:
      "বাতাসের গতি বেশি। ফসলের ক্ষতি পর্যবেক্ষণ করুন।",

    normalMonitoring:
      "বর্তমান আবহাওয়া অনুকূল। স্বাভাবিক কৃষি পর্যবেক্ষণ চালিয়ে যান.",
  },
};

// ============================================================
// LANGUAGE PROVIDER
// ============================================================

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return (
      localStorage.getItem("language") ||
      "en"
    );
  });

  const setLanguage = (newLanguage) => {
    if (!translations[newLanguage]) {
      return;
    }

    setLanguageState(newLanguage);

    localStorage.setItem(
      "language",
      newLanguage
    );
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t =
    translations[language] ||
    translations.en;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// ============================================================
// USE LANGUAGE HOOK
// ============================================================

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used within LanguageProvider"
    );
  }

  return context;
};
