import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import Games from "@/pages/games";
import PackPage from "@/pages/Pack";
import PracticePage from "@/pages/Practice";
import PracticeHub from "@/pages/Play";
import Settings from "@/pages/Settings";
import PlaySee from "@/pages/PlaySee";
import PlayMCQ from "@/pages/PlayMCQ";
import PlaySlot from "@/pages/PlaySlot";
import CutGames from "@/pages/CutGames";
import FunhouseHub from "@/pages/FunhouseHub";
import FunhouseGame from "@/pages/FunhouseGame";
import FunhousePast from "@/pages/FunhousePast";
import FunhouseReplay from "@/pages/FunhouseReplay";
import FunhouseDebug from "@/pages/FunhouseDebug";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Cookies from "@/pages/Cookies";
import DMCA from "@/pages/DMCA";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ResetPassword from "@/pages/ResetPassword";
import Welcome from "@/pages/Welcome";
import Game from "@/pages/Game";
import SiteChrome from "@/components/SiteChrome";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import GoodWord from "@/games/goodword";
import SigilSyntaxGame from "@/pages/SigilSyntaxGame";

function useDebugParam() {
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("debug") === "1") {
      document.body.classList.add("debug-outline");
    } else {
      document.body.classList.remove("debug-outline");
    }

    return () => {
      document.body.classList.remove("debug-outline");
    };
  }, []);
}

export default function App() {
  useDebugParam();

  return (
    <ErrorBoundary>
      <SiteChrome>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/goodword" element={<GoodWord />} />
          <Route path="/sigil/*" element={<SigilSyntaxGame />} />

          {/* --- Aliases / legacy paths --- */}
          <Route path="/games/sigil-syntax/*" element={<Navigate to="/sigil" replace />} />
          <Route path="/sigil-syntax/*" element={<Navigate to="/sigil" replace />} />
          <Route path="/games/SigilSyntax" element={<Navigate to="/sigil" replace />} />

          <Route path="/pack/:id" element={<PackPage />} />
          <Route path="/practice" element={<PracticeHub />} />
          <Route path="/practice/:id" element={<PracticePage />} />
          <Route path="/play/cut-games" element={<CutGames />} />
          <Route path="/funhouse" element={<FunhouseHub />} />
          <Route path="/funhouse/past" element={<FunhousePast />} />
          <Route path="/funhouse/replay/:id" element={<FunhouseReplay />} />
          <Route path="/funhouse/:id" element={<FunhouseGame />} />
          <Route path="/funhouse-debug" element={<FunhouseDebug />} />
          <Route path="/play/:id/see" element={<PlaySee />} />
          <Route path="/play/:id/mcq" element={<PlayMCQ />} />
          <Route path="/play/:id/slot" element={<PlaySlot />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/dmca" element={<DMCA />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/game" element={<Game />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SiteChrome>
    </ErrorBoundary>
  );
}
