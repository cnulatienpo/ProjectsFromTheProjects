import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from '@/pages/Home.jsx'
import Games from '@/pages/Games.jsx'
import SigilSyntax from '@/pages/SigilSyntax.jsx'
import GoodWord from '@/pages/GoodWord.jsx'
import '@/styles/links.css'

const routes = [
  { path: '/', element: <Home /> },
  { path: '/games', element: <Games /> },
  { path: '/sigil', element: <SigilSyntax /> },
  { path: '/sigil/:id', element: <SigilSyntax /> },
  { path: '/goodword/:id', element: <GoodWord /> },
]

const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL
})

export default function App() {
  return <RouterProvider router={router} />
}
