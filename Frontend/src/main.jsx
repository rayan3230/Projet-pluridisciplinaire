import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Add missing import
import './index.css'
import { AuthProvider } from './context/AuthContext'
// Remove unused imports
// import Filter from './components/Filter/Filter.jsx'; 
// import { BrowserRouter, Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App /> 
    </AuthProvider>
  </React.StrictMode>,
)
