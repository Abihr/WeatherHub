import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  Home,
  Users,
  Map,
  Train,
  Bot,
  Sprout,
} from "lucide-react";

const primaryLinks = [
  {
    to: "/",
    label: "Home",
    icon: Home,
    end: true,
  },
  {
    to: "/friends",
    label: "Friends",
    icon: Users,
  },
  {
    to: "/map",
    label: "Map",
    icon: Map,
  },
  {
    to: "/railway-weather",
    label: "Railway",
    icon: Train,
  },
  {
    to: "/chatbot",
    label: "Chatbot",
    icon: Bot,
  },
  {
    to: "/farmer",
    label: "Agriculture",
    icon: Sprout,
  },
];

export default function BottomNav() {
  const [agricultureMode, setAgricultureMode] = useState(
    localStorage.getItem("agricultureMode") === "true"
  );

  useEffect(() => {
    const handleAgricultureModeChange = () => {
      setAgricultureMode(
        localStorage.getItem("agricultureMode") === "true"
      );
    };

    window.addEventListener(
      "agricultureModeChanged",
      handleAgricultureModeChange
    );

    return () => {
      window.removeEventListener(
        "agricultureModeChanged",
        handleAgricultureModeChange
      );
    };
  }, []);

  const visibleLinks = primaryLinks.filter(
    ({ to }) =>
      to !== "/farmer" || agricultureMode
  );

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-[9999]
        md:hidden
        flex
        items-center
        justify-between
        border-t
        border-sky-100
        bg-white/95
        px-2
        py-1.5
        pb-[calc(0.375rem+env(safe-area-inset-bottom))]
        backdrop-blur-sm
      "
    >
      {visibleLinks.map(
        ({
          to,
          label,
          icon: Icon,
          end,
        }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `
                flex
                flex-1
                flex-col
                items-center
                justify-center
                gap-0.5
                rounded-xl
                px-2
                py-1.5
                text-[10px]
                font-medium
                transition-colors
                active:scale-95
                ${
                  isActive
                    ? "text-sky-600"
                    : "text-ink-400"
                }
              `
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={19}
                  strokeWidth={
                    isActive ? 2.4 : 2
                  }
                />

                <span>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        )
      )}
    </nav>
  );
}