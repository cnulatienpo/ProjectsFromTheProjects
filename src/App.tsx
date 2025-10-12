import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import Home from './pages/Home';
import Deck from './pages/Deck';
import Play from './pages/Play';
import CutGamesDebug from './dev/CutGamesDebug';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-brand-soft text-brand">
        <Header />
        <div className="pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pack/:id" element={<Deck />} />
            <Route path="/play/:id" element={<Play />} />
            <Route path="/dev/cut-games" element={<CutGamesDebug />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
