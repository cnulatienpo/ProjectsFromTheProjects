import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import routes from './routes' // or your existing route config

const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL  // <-- critical for GitHub Pages
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

