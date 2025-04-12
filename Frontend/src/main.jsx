import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.jsx' // Comment out App for now
import './index.css'
import { AuthProvider } from './context/AuthContext'
import Filter from './components/Filter/Filter.jsx'; // Import Filter
import { BrowserRouter, Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>

      <AuthProvider>
        {/* Render Filter component directly for testing */}
        <Filter />
        {/* 
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
             Add other routes 
          </Routes>
        </BrowserRouter>
        */}
      </AuthProvider>

  </React.StrictMode>,
)
