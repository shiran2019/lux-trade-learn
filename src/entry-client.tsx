import React from 'react'
import ReactDOM from 'react-dom/client'
import { Router } from '@tanstack/react-router'
import { getRouter } from './router'

const router = getRouter()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router router={router} />
  </React.StrictMode>,
)
