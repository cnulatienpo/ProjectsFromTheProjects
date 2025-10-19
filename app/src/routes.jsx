import React from 'react'
import SigilClassic from '@/pages/SigilClassic'
import GoodWord from '@/pages/GoodWord.jsx'
import Home from '@/pages/Home.jsx'
import Games from '@/pages/Games.jsx'

const routes = [
  { path: '/', element: <Home /> },
  { path: '/games', element: <Games /> },

  // Sigil_&_Syntax
  { path: '/sigil', element: <SigilClassic /> },        // classic UI loads first lesson internally
  { path: '/sigil/:id', element: <SigilClassic /> },

  // The Good Word
  { path: '/goodword/:id', element: <GoodWord /> }
]

export default routes
