import React from 'react'
import SigilSyntax from '@/pages/SigilSyntax.jsx'
import GoodWord from '@/pages/GoodWord.jsx'
import Home from '@/pages/Home.jsx'
import Games from '@/pages/Games.jsx'

const routes = [
  { path: '/', element: <Home /> },
  { path: '/games', element: <Games /> },

  // Sigil_&_Syntax
  { path: '/sigil', element: <SigilSyntax /> },        // redirects to first lesson internally
  { path: '/sigil/:id', element: <SigilSyntax /> },

  // The Good Word
  { path: '/goodword/:id', element: <GoodWord /> }
]

export default routes
