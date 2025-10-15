import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ErrorBoundary from '@/components/ErrorBoundary.jsx'
import Home from '@/pages/Home.jsx'
import SigilSyntax from '@/pages/SigilSyntax.jsx'
import GoodWord from '@/pages/GoodWord.jsx'

const routes = [
  { path: '/', element: <Home /> },
  { path: '/sigil', element: <SigilSyntax /> },
  { path: '/sigil/:id', element: <SigilSyntax /> },
  { path: '/goodword/:id', element: <GoodWord /> },
  { path: '*', element: <div style={{padding:24}}>Not found. <a href="/">Home</a></div> }
]

const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL })

export default function App(){
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
