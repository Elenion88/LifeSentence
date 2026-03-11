import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConvexProvider, ConvexReactClient, useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "../convex/_generated/api";
import AppShell from "./components/layout/AppShell";
import WeeklyView from "./views/WeeklyView";
import MonthlyView from "./views/MonthlyView";
import AnalyticsView from "./views/AnalyticsView";
import SettingsView from "./views/SettingsView";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function SeedOnMount() {
  const seedHabits = useMutation(api.habits.seed);
  useEffect(() => { seedHabits(); }, []);
  return null;
}

function App() {
  return (
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <SeedOnMount />
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/week" replace />} />
            <Route path="/week" element={<WeeklyView />} />
            <Route path="/month" element={<MonthlyView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ConvexProvider>
  );
}

export default App;
