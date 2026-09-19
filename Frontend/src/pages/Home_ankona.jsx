// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   Sun,
//   Cloud,
//   CloudRain,
//   CloudSun,
//   Wind,
//   Droplets,
//   MapPin,
//   Bell,
//   Users,
//   Map as MapIcon,
//   Bot,
//   ChevronRight,
//   Sparkles,
//   Eye,
// } from "lucide-react";

// import { useLanguage } from "../context/LanguageContext";
// import {
//   RainEffect,
//   SnowEffect,
//   SunEffect,
//   CloudsEffect,
// } from "../components/WeatherEffects";
// import { useApp } from "../context/AppContext";

// // =====================================================
// // MOCK WEATHER
// // Replace this with your real Firebase/API weather later
// // =====================================================

// const MOCK_WEATHER = {
//   city: "Pune, Maharashtra",
//   temp: 32,
//   feelsLike: 35,
//   condition: "Sunny",

//   humidity: 65,
//   windSpeed: 12,
//   rainfall: 0,
//   uvIndex: 7,
//   visibility: 10,
//   pressure: 1013,

//   hourly: [
//     { time: "Now", temp: 32, icon: "☀️" },
//     { time: "11 AM", temp: 33, icon: "☀️" },
//     { time: "12 PM", temp: 34, icon: "🌤️" },
//     { time: "1 PM", temp: 35, icon: "🌤️" },
//     { time: "2 PM", temp: 34, icon: "⛅" },
//     { time: "3 PM", temp: 32, icon: "⛅" },
//     { time: "4 PM", temp: 30, icon: "🌦️" },
//   ],

//   weekly: [
//     { day: "Mon", max: 32, min: 24, icon: "☀️" },
//     { day: "Tue", max: 30, min: 23, icon: "⛅" },
//     { day: "Wed", max: 28, min: 22, icon: "🌦️" },
//     { day: "Thu", max: 26, min: 21, icon: "🌧️" },
//     { day: "Fri", max: 27, min: 22, icon: "☁️" },
//     { day: "Sat", max: 29, min: 23, icon: "☀️" },
//     { day: "Sun", max: 31, min: 24, icon: "☀️" },
//   ],
// };

// // =====================================================
// // HOME
// // =====================================================

// const Home = () => {
//   const navigate = useNavigate();

//   const { t } = useLanguage();

//   const { user, alerts } = useApp();

//   const [weather] = useState(MOCK_WEATHER);

//   const [time, setTime] = useState(new Date());

//   // =====================================================
//   // LIVE CLOCK
//   // =====================================================

//   useEffect(() => {
//     const id = setInterval(() => {
//       setTime(new Date());
//     }, 60000);

//     return () => clearInterval(id);
//   }, []);

//   // =====================================================
//   // WEATHER ICON
//   // =====================================================

//   const getWeatherIcon = (condition, size = 96) => {
//     const cls = "text-white drop-shadow-2xl animate-float";

//     switch (condition) {
//       case "Sunny":
//         return (
//           <Sun
//             size={size}
//             className={cls}
//             strokeWidth={1.5}
//           />
//         );

//       case "Partly Cloudy":
//         return (
//           <CloudSun
//             size={size}
//             className={cls}
//             strokeWidth={1.5}
//           />
//         );

//       case "Cloudy":
//         return (
//           <Cloud
//             size={size}
//             className={cls}
//             strokeWidth={1.5}
//           />
//         );

//       case "Light Rain":
//       case "Heavy Rain":
//         return (
//           <CloudRain
//             size={size}
//             className={cls}
//             strokeWidth={1.5}
//           />
//         );

//       case "Storm":
//         return (
//           <CloudRain
//             size={size}
//             className={cls}
//             strokeWidth={1.5}
//           />
//         );

//       default:
//         return (
//           <Sun
//             size={size}
//             className={cls}
//             strokeWidth={1.5}
//           />
//         );
//     }
//   };

//   // =====================================================
//   // SKY GRADIENT
//   // =====================================================

//   const skyClass = () => {
//     switch (weather.condition) {
//       case "Sunny":
//         return "from-sky-400 via-sky-500 to-blue-600";

//       case "Partly Cloudy":
//         return "from-sky-400 via-sky-500 to-indigo-500";

//       case "Cloudy":
//         return "from-slate-400 via-sky-500 to-indigo-600";

//       case "Light Rain":
//         return "from-sky-600 via-slate-600 to-indigo-700";

//       case "Heavy Rain":
//         return "from-slate-700 via-sky-800 to-indigo-900";

//       case "Storm":
//         return "from-slate-800 via-indigo-900 to-black";

//       default:
//         return "from-sky-400 via-sky-500 to-blue-600";
//     }
//   };

//   // =====================================================
//   // 3D WEATHER EFFECT
//   // =====================================================

//   const renderWeatherEffect = () => {
//     switch (weather.condition) {
//       case "Light Rain":
//         return <RainEffect intensity="light" />;

//       case "Heavy Rain":
//         return <RainEffect intensity="heavy" />;

//       case "Storm":
//         return (
//           <>
//             <RainEffect intensity="heavy" />

//             <div
//               className="
//                 fixed
//                 inset-0
//                 pointer-events-none
//                 z-10
//                 animate-ping-slow
//                 bg-white/0
//               "
//             />
//           </>
//         );

//       case "Snow":
//         return <SnowEffect />;

//       case "Sunny":
//         return <SunEffect />;

//       case "Cloudy":
//       case "Partly Cloudy":
//         return <CloudsEffect />;

//       default:
//         return null;
//     }
//   };

//   // =====================================================
//   // QUICK ACTIONS
//   // =====================================================

//   const quickActions = [
//     {
//       label: t.talkToAI,
//       icon: Bot,
//       onClick: () => navigate("/chatbot"),
//       gradient: "from-violet-500 to-purple-600",
//       sparkle: true,
//     },

//     {
//       label: t.viewMap,
//       icon: MapIcon,
//       onClick: () => navigate("/map"),
//       gradient: "from-sky-500 to-blue-600",
//     },

//     {
//       label: t.friendsWeather,
//       icon: Users,
//       onClick: () => navigate("/friends"),
//       gradient: "from-emerald-500 to-green-600",
//     },

//     {
//       label: t.alerts,
//       icon: Bell,
//       onClick: () => navigate("/alerts"),
//       gradient: "from-amber-500 to-orange-600",
//       badge: alerts?.length,
//     },
//   ];

//   // =====================================================
//   // UI
//   // =====================================================

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-sky-50">

//       {/* =================================================
//           3D WEATHER EFFECT LAYER
//       ================================================= */}

//       {renderWeatherEffect()}

//       {/* =================================================
//           HERO WEATHER CARD
//       ================================================= */}

//       <div className="relative z-20 px-4 sm:px-6 pt-6 pb-8">
//         <div
//           className={`
//             relative
//             overflow-hidden
//             rounded-3xl
//             bg-gradient-to-br
//             ${skyClass()}
//             text-white
//             shadow-pop
//             card-3d
//           `}
//           style={{ minHeight: 320 }}
//         >

//           {/* Decorative blobs */}

//           <div
//             className="
//               absolute
//               -top-24
//               -right-24
//               w-72
//               h-72
//               bg-white/10
//               rounded-full
//               blur-2xl
//             "
//           />

//           <div
//             className="
//               absolute
//               -bottom-16
//               -left-16
//               w-64
//               h-64
//               bg-white/10
//               rounded-full
//               blur-2xl
//             "
//           />

//           {/* Sunny glow */}

//           {weather.condition === "Sunny" && (
//             <div
//               className="
//                 absolute
//                 top-8
//                 right-8
//                 w-40
//                 h-40
//                 bg-yellow-300/40
//                 rounded-full
//                 blur-3xl
//                 animate-pulse-slow
//               "
//             />
//           )}

//           <div className="relative p-6 sm:p-8">

//             {/* =================================================
//                 TOP ROW
//             ================================================= */}

//             <div className="flex items-start justify-between flex-wrap gap-3">

//               <div>
//                 <div
//                   className="
//                     flex
//                     items-center
//                     gap-2
//                     text-white/90
//                     text-sm
//                     font-medium
//                   "
//                 >
//                   <MapPin size={16} />

//                   <span>
//                     {weather.city}
//                   </span>
//                 </div>

//                 <p className="text-xs text-white/70 mt-1">
//                   {time.toLocaleDateString(undefined, {
//                     weekday: "long",
//                     day: "numeric",
//                     month: "long",
//                   })}
//                 </p>
//               </div>

//               {/* Condition badge */}

//               <div
//                 className="
//                   flex
//                   items-center
//                   gap-2
//                   px-3
//                   py-1.5
//                   rounded-full
//                   bg-white/15
//                   backdrop-blur-sm
//                   text-xs
//                   font-semibold
//                 "
//               >
//                 <Sparkles
//                   size={14}
//                   className="text-yellow-200"
//                 />

//                 {weather.condition}
//               </div>
//             </div>

//             {/* =================================================
//                 TEMPERATURE + ICON
//             ================================================= */}

//             <div
//               className="
//                 flex
//                 items-center
//                 justify-between
//                 mt-6
//                 flex-wrap
//                 gap-4
//               "
//             >

//               <div>
//                 <div className="flex items-start">

//                   <span
//                     className="
//                       text-7xl
//                       sm:text-8xl
//                       font-display
//                       font-extrabold
//                       leading-none
//                     "
//                   >
//                     {weather.temp}
//                   </span>

//                   <span
//                     className="
//                       text-3xl
//                       font-bold
//                       mt-2
//                     "
//                   >
//                     °C
//                   </span>

//                 </div>

//                 <p className="text-white/80 mt-2 text-sm">
//                   {t.feelsLike}:{" "}
//                   <span className="font-semibold">
//                     {weather.feelsLike}°C
//                   </span>
//                 </p>
//               </div>

//               {/* Animated weather icon */}

//               <div className="relative">
//                 {getWeatherIcon(
//                   weather.condition,
//                   120
//                 )}
//               </div>

//             </div>

//             {/* =================================================
//                 WEATHER STATS
//             ================================================= */}

//             <div
//               className="
//                 grid
//                 grid-cols-3
//                 sm:grid-cols-4
//                 gap-3
//                 mt-6
//               "
//             >
//               <StatPill
//                 icon={Droplets}
//                 label={t.humidity}
//                 value={`${weather.humidity}%`}
//               />

//               <StatPill
//                 icon={Wind}
//                 label={t.windSpeed}
//                 value={`${weather.windSpeed} km/h`}
//               />

//               <StatPill
//                 icon={Sun}
//                 label={t.uvIndex}
//                 value={weather.uvIndex}
//               />

//               <StatPill
//                 icon={Eye}
//                 label="Visibility"
//                 value={`${weather.visibility} km`}
//               />
//             </div>

//           </div>
//         </div>
//       </div>

//       {/* =================================================
//           QUICK ACTIONS
//       ================================================= */}

//       <div className="relative z-20 px-4 sm:px-6">

//         <h2
//           className="
//             text-lg
//             font-display
//             font-bold
//             text-ink-900
//             mb-3
//             flex
//             items-center
//             gap-2
//           "
//         >
//           <Sparkles
//             size={18}
//             className="text-sky-500"
//           />

//           {t.quickActions}
//         </h2>

//         <div
//           className="
//             grid
//             grid-cols-2
//             sm:grid-cols-4
//             gap-3
//           "
//         >
//           {quickActions.map((action, index) => {
//             const Icon = action.icon;

//             return (
//               <button
//                 key={index}
//                 onClick={action.onClick}
//                 className={`
//                   group
//                   relative
//                   overflow-hidden
//                   rounded-2xl
//                   p-4
//                   text-left
//                   text-white
//                   bg-gradient-to-br
//                   ${action.gradient}
//                   shadow-card
//                   hover:shadow-pop
//                   transition-all
//                   duration-300
//                   hover:-translate-y-1
//                 `}
//               >

//                 <div
//                   className="
//                     absolute
//                     inset-0
//                     bg-white/0
//                     group-hover:bg-white/10
//                     transition-colors
//                   "
//                 />

//                 <div className="relative">

//                   <div
//                     className="
//                       w-10
//                       h-10
//                       rounded-xl
//                       bg-white/20
//                       backdrop-blur-sm
//                       flex
//                       items-center
//                       justify-center
//                       mb-3
//                       relative
//                     "
//                   >
//                     <Icon
//                       size={20}
//                       strokeWidth={2.2}
//                     />

//                     {action.sparkle && (
//                       <Sparkles
//                         size={12}
//                         className="
//                           absolute
//                           -top-1
//                           -right-1
//                           text-yellow-300
//                           animate-pulse
//                         "
//                       />
//                     )}

//                     {action.badge > 0 && (
//                       <span
//                         className="
//                           absolute
//                           -top-1
//                           -right-1
//                           bg-red-500
//                           text-white
//                           text-[10px]
//                           font-bold
//                           rounded-full
//                           h-5
//                           min-w-5
//                           px-1
//                           flex
//                           items-center
//                           justify-center
//                         "
//                       >
//                         {action.badge}
//                       </span>
//                     )}
//                   </div>

//                   <p className="font-semibold text-sm">
//                     {action.label}
//                   </p>

//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* =================================================
//           HOURLY FORECAST
//       ================================================= */}

//       <div className="relative z-20 px-4 sm:px-6 mt-6">

//         <div
//           className="
//             bg-white/80
//             backdrop-blur-sm
//             rounded-2xl
//             p-5
//             shadow-card
//             border
//             border-sky-100
//           "
//         >

//           <h3
//             className="
//               text-base
//               font-display
//               font-bold
//               text-ink-900
//               mb-4
//             "
//           >
//             {t.hourlyForecast}
//           </h3>

//           <div
//             className="
//               flex
//               gap-3
//               overflow-x-auto
//               scrollbar-hide
//               pb-1
//             "
//           >
//             {weather.hourly.map((hour, index) => (
//               <div
//                 key={index}
//                 className={`
//                   shrink-0
//                   w-20
//                   text-center
//                   p-3
//                   rounded-xl
//                   transition-all
//                   ${
//                     index === 0
//                       ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md"
//                       : "bg-sky-50 hover:bg-sky-100"
//                   }
//                 `}
//               >
//                 <p
//                   className={`
//                     text-xs
//                     font-medium
//                     ${
//                       index === 0
//                         ? "text-white/80"
//                         : "text-ink-400"
//                     }
//                   `}
//                 >
//                   {hour.time}
//                 </p>

//                 <div className="text-2xl my-2">
//                   {hour.icon}
//                 </div>

//                 <p
//                   className={`
//                     text-sm
//                     font-bold
//                     ${
//                       index === 0
//                         ? "text-white"
//                         : "text-ink-800"
//                     }
//                   `}
//                 >
//                   {hour.temp}°
//                 </p>
//               </div>
//             ))}
//           </div>

//         </div>
//       </div>

//       {/* =================================================
//           WEEKLY FORECAST
//       ================================================= */}

//       <div className="relative z-20 px-4 sm:px-6 mt-6">

//         <div
//           className="
//             bg-white/80
//             backdrop-blur-sm
//             rounded-2xl
//             p-5
//             shadow-card
//             border
//             border-sky-100
//           "
//         >

//           <h3
//             className="
//               text-base
//               font-display
//               font-bold
//               text-ink-900
//               mb-4
//             "
//           >
//             {t.weeklyForecast}
//           </h3>

//           <div className="space-y-2">

//             {weather.weekly.map((day, index) => (
//               <div
//                 key={index}
//                 className="
//                   flex
//                   items-center
//                   gap-4
//                   p-2
//                   rounded-xl
//                   hover:bg-sky-50
//                   transition-colors
//                 "
//               >

//                 <span
//                   className="
//                     w-12
//                     text-sm
//                     font-semibold
//                     text-ink-600
//                   "
//                 >
//                   {day.day}
//                 </span>

//                 <span className="text-2xl">
//                   {day.icon}
//                 </span>

//                 <div className="flex-1" />

//                 <span className="text-sm text-ink-500">
//                   {day.min}°
//                 </span>

//                 <div
//                   className="
//                     w-24
//                     h-1.5
//                     rounded-full
//                     bg-gradient-to-r
//                     from-sky-300
//                     to-sun-400
//                     relative
//                     overflow-hidden
//                   "
//                 >
//                   <div
//                     className="
//                       absolute
//                       inset-y-0
//                       left-0
//                       rounded-full
//                       bg-gradient-to-r
//                       from-sky-500
//                       to-sun-500
//                     "
//                     style={{
//                       width: `${Math.min(
//                         100,
//                         Math.max(
//                           0,
//                           ((day.max - 20) / 20) * 100
//                         )
//                       )}%`,
//                     }}
//                   />
//                 </div>

//                 <span
//                   className="
//                     text-sm
//                     font-bold
//                     text-ink-800
//                     w-8
//                     text-right
//                   "
//                 >
//                   {day.max}°
//                 </span>

//               </div>
//             ))}

//           </div>
//         </div>
//       </div>

//       {/* =================================================
//           ALERTS
//       ================================================= */}

//       <div
//         className="
//           relative
//           z-20
//           px-4
//           sm:px-6
//           mt-6
//           pb-10
//         "
//       >

//         <div
//           className="
//             bg-white/80
//             backdrop-blur-sm
//             rounded-2xl
//             p-5
//             shadow-card
//             border
//             border-sky-100
//           "
//         >

//           <div
//             className="
//               flex
//               items-center
//               justify-between
//               mb-3
//             "
//           >
//             <h3
//               className="
//                 text-base
//                 font-display
//                 font-bold
//                 text-ink-900
//               "
//             >
//               {t.weatherAlerts}
//             </h3>

//             <button
//               onClick={() => navigate("/alerts")}
//               className="
//                 text-xs
//                 font-semibold
//                 text-sky-600
//                 hover:text-sky-700
//                 flex
//                 items-center
//                 gap-1
//               "
//             >
//               {t.viewAll}

//               <ChevronRight size={14} />
//             </button>
//           </div>

//           {alerts?.length > 0 ? (
//             <div className="space-y-2">

//               {alerts.slice(0, 2).map((alert, index) => (
//                 <div
//                   key={index}
//                   className="
//                     flex
//                     items-start
//                     gap-3
//                     p-3
//                     rounded-xl
//                     bg-amber-50
//                     border
//                     border-amber-100
//                   "
//                 >
//                   <Bell
//                     size={16}
//                     className="
//                       text-amber-500
//                       mt-0.5
//                     "
//                   />

//                   <p className="text-sm text-ink-700">
//                     {alert.message || "Weather alert"}
//                   </p>
//                 </div>
//               ))}

//             </div>
//           ) : (
//             <div
//               className="
//                 flex
//                 items-center
//                 gap-3
//                 p-4
//                 rounded-xl
//                 bg-green-50
//                 border
//                 border-green-100
//               "
//             >
//               <CloudSun
//                 size={20}
//                 className="text-green-500"
//               />

//               <p className="text-sm text-ink-600">
//                 {t.noAlerts}
//               </p>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// // =====================================================
// // STAT PILL
// // =====================================================

// const StatPill = ({
//   icon: Icon,
//   label,
//   value,
// }) => (
//   <div
//     className="
//       flex
//       items-center
//       gap-2
//       px-3
//       py-2
//       rounded-xl
//       bg-white/15
//       backdrop-blur-sm
//     "
//   >
//     <Icon
//       size={16}
//       className="text-white/90"
//     />

//     <div className="min-w-0">

//       <p
//         className="
//           text-[10px]
//           text-white/70
//           uppercase
//           tracking-wide
//           leading-none
//         "
//       >
//         {label}
//       </p>

//       <p
//         className="
//           text-sm
//           font-semibold
//           text-white
//           truncate
//         "
//       >
//         {value}
//       </p>

//     </div>
//   </div>
// );

// export default Home;