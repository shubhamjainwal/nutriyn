"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import Dashboard from "@/components/Dashboard/Dashboard";
import MealLog from "@/components/MealLog/MealLog";
import Recipes from "@/components/Recipes/Recipes";
import WeightTracker from "@/components/WeightTracker/WeightTracker";
import Settings from "@/components/Settings/Settings";
import FoodSearch from "@/components/FoodSearch/FoodSearch";
import type { TabId } from "@/types/nutrition";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "dashboard", label: "Today",   icon: "ti-home-2"         },
  { id: "log",       label: "Meals",   icon: "ti-clipboard-list" },
  { id: "recipes",   label: "Recipes", icon: "ti-bowl-chopsticks"},
  { id: "weight",    label: "Weight",  icon: "ti-trending-up"    },
  { id: "settings",  label: "Goals",   icon: "ti-target"         },
];

const MEAL_ICONS: Record<string, string> = {
  Breakfast: "☀️", Lunch: "🌤️", Dinner: "🌙", Snacks: "🍎",
};

const dateLabel = new Date().toLocaleDateString("en-US", {
  weekday: "short", month: "short", day: "numeric",
});

export default function AppShell() {
  const { activeTab, setTab, searchCtx, init } = useStore();

  useEffect(() => { init(); }, [init]);

  return (
    <>
      <div className="app-shell">
        {/* Top bar */}
        <header className="topbar">
          <div className="topbar-brand">
            <div className="topbar-logo" aria-hidden="true">🥗</div>
            <span className="topbar-title">Nutriyn</span>
          </div>
          <span className="topbar-date">{dateLabel}</span>
        </header>

        {/* Page content */}
        <main className="scroll-area">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "log"       && <MealLog />}
          {activeTab === "recipes"   && <Recipes />}
          {activeTab === "weight"    && <WeightTracker />}
          {activeTab === "settings"  && <Settings />}
        </main>

        {/* Bottom Nav */}
        <nav className="bottom-nav" aria-label="Main navigation">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`nav-item${activeTab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
              aria-current={activeTab === t.id ? "page" : undefined}
            >
              <span className="nav-icon">
                <i className={`ti ${t.icon}`} aria-hidden="true" />
              </span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Food Search Modal */}
      {searchCtx && <FoodSearch mealType={searchCtx.mealType} />}
    </>
  );
}
