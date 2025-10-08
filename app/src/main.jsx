import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home.jsx'
import GameIntro from './pages/GameIntro.jsx'
import GameStart from './pages/GameStart.jsx'
import Grammar101 from './pages/Grammar101.jsx'
import Devices101 from './pages/Devices101.jsx'
import UploadTest from './pages/UploadTest.jsx'
import ArcadeApp from './pages/ArcadeApp.jsx'
import './styles.css'

if (import.meta.env.DEV) {
  import('./mocks/apiMock').then(m => m.installApiMock())
}

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/game', element: <GameIntro /> },
  { path: '/game/start', element: <GameStart /> },
  { path: '/game/lesson/grammar-101', element: <Grammar101 /> },
  { path: '/game/lesson/devices-101', element: <Devices101 /> },
  { path: '/upload-test', element: <UploadTest /> },
  { path: '/arcade', element: <ArcadeApp /> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

