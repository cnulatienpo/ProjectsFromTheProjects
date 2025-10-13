import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import PackPage from "./pages/Pack";
import PracticePage from "./pages/Practice";
import PracticeHub from "./pages/Play";
import Settings from "./pages/Settings";
import PlaySee from "./pages/PlaySee";
import PlayMCQ from "./pages/PlayMCQ";
import PlaySlot from "./pages/PlaySlot";
import NotFound from "./pages/NotFound";
import { Header } from "./components/Header";
import { ToastHost } from "./components/ToastHost";
import { KeyOverlay } from "./components/KeyOverlay";
import { Footer } from "./components/Footer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Welcome from "./pages/Welcome";
import { useFirstRun } from "./state/useFirstRun";

export default function App() {
  const seenWelcome = useFirstRun((state) => state.seenWelcome);
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
          <Header />
          <ToastHost />
          <KeyOverlay />
          <Routes>
            <Route path="/" element={seenWelcome ? <Home /> : <Welcome />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/pack/:id" element={<PackPage />} />
            <Route path="/practice" element={<PracticeHub />} />
            <Route path="/practice/:id" element={<PracticePage />} />
            <Route path="/play/:id/see" element={<PlaySee />} />
            <Route path="/play/:id/mcq" element={<PlayMCQ />} />
            <Route path="/play/:id/slot" element={<PlaySlot />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
