// import { NavLink } from "react-router-dom";
// import { useEffect, useState } from "react";

// import {
//   Home,
//   Users,
//   Inbox,
//   Map,
//   RefreshCw,
//   Bell,
//   User,
//   Settings,
//   Bot,
//   Sprout,
//   Train,
// } from "lucide-react";

// import { useApp } from "../context/AppContext";
// import logo from "../assets/logo_simple.png";

// const links = [
//   {
//     to: "/",
//     label: "Home",
//     icon: Home,
//   },

//   {
//     to: "/friends",
//     label: "Friends",
//     icon: Users,
//   },

//   // {
//   //   to: "/requests",
//   //   label: "Requests",
//   //   icon: Inbox,
//   // },

//   {
//     to: "/map",
//     label: "Map",
//     icon: Map,
//   },

//   // {
//   //   to: "/compare",
//   //   label: "Compare",
//   //   icon: RefreshCw,
//   // },

//   {
//     to: "/chatbot",
//     label: "WeatherGPT",
//     icon: Bot,
//   },

//   {
//     to: "/alerts",
//     label: "Alerts",
//     icon: Bell,
//   },

//   {
//     to: "/farmer",
//     label: "Agriculture",
//     icon: Sprout,
//   },

//   {
//     to: "/profile",
//     label: "Profile",
//     icon: User,
//   },

//   {
//     to: "/railway-weather",
//     label: "Railway Weather",
//     icon: Train,
//   },
// ];

// export default function Sidebar() {
//   const { received } = useApp();

//   const [agricultureMode, setAgricultureMode] = useState(
//     localStorage.getItem("agricultureMode") === "true"
//   );

//   useEffect(() => {
//     const handleAgricultureModeChange = () => {
//       setAgricultureMode(
//         localStorage.getItem("agricultureMode") === "true"
//       );
//     };

//     window.addEventListener(
//       "agricultureModeChanged",
//       handleAgricultureModeChange
//     );

//     return () => {
//       window.removeEventListener(
//         "agricultureModeChanged",
//         handleAgricultureModeChange
//       );
//     };
//   }, []);

//   return (
//     <aside className="flex md:hidden w-full shrink-0 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm">
      
//       {/* =====================================================
//           MOBILE NAVIGATION
//       ===================================================== */}
//       <nav className="w-full overflow-x-auto scrollbar-hide px-3 py-2">
//         <div className="flex items-center gap-1.5 min-w-max">

//           {/* Logo */}
//           <NavLink
//             to="/"
//             className="shrink-0 mr-1"
//           >
//             <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-100 to-blue-50 border border-sky-100 shadow-sm flex items-center justify-center overflow-hidden">
//               <img
//                 src={logo}
//                 alt="WeatherHub logo"
//                 className="w-full h-full object-contain transition-transform duration-200 hover:scale-110"
//               />
//             </div>
//           </NavLink>

//           {/* Navigation Links */}
//           {links
//             .filter(
//               ({ to }) =>
//                 to !== "/farmer" || agricultureMode
//             )
//             .map(
//               ({
//                 to,
//                 label,
//                 icon: Icon,
//               }) => (
//                 <NavLink
//                   key={to}
//                   to={to}
//                   end={to === "/"}
//                   className={({ isActive }) =>
//                     `relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
//                       isActive
//                         ? "bg-sky-100 text-sky-700 shadow-sm"
//                         : "text-ink-500 hover:bg-sky-50 hover:text-ink-800"
//                     }`
//                   }
//                 >
//                   <Icon
//                     size={16}
//                     strokeWidth={2.2}
//                     className="shrink-0"
//                   />

//                   <span>{label}</span>

//                   {/* Friend Request Badge */}
//                   {label === "Requests" &&
//                     received.length > 0 && (
//                       <span className="ml-0.5 text-[9px] font-bold bg-sun-400 text-white rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
//                         {received.length}
//                       </span>
//                     )}
//                 </NavLink>
//               )
//             )}

//           {/* Settings */}
//           <NavLink
//             to="/settings"
//             className={({ isActive }) =>
//               `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
//                 isActive
//                   ? "bg-sky-100 text-sky-700 shadow-sm"
//                   : "text-ink-500 hover:bg-sky-50 hover:text-ink-800"
//               }`
//             }
//           >
//             <Settings
//               size={16}
//               strokeWidth={2.2}
//             />

//             <span>Settings</span>
//           </NavLink>

//         </div>
//       </nav>
//     </aside>
//   );
// }