import React from 'react'
import ReactDOM from 'react-dom/client'
import { Router } from '@tanstack/react-router'
import { createRouter } from './router'

const router = createRouter()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router router={router} />
  </React.StrictMode>,
)
