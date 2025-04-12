import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.jsx' // Comment out or remove App import
// import Home from './components/Home/Home.jsx'; // Import the Home component
// import NavBar from './components/Layout/NavBar.jsx'; // Remove or comment out NavBar import
// import AppNavbar from './components/Appnavbar/AppNavbar.jsx'; // Import the AppNavbar
// import NoExam from './APP/User/NoExam/Noexam.jsx'; // Import NoExam
// import PendingRequestsPage from './APP/User/PendingRequests/PendingRequests.jsx'; // Import the page component
// import Swap from './components/Swap/Swap.jsx'; // Import Swap component
// import TimeswapPage from './APP/User/Timeswap/Timeswap.jsx'; // Import TimeswapPage
import './index.css'
import { AuthProvider } from './context/AuthContext'
import AppRouter from './routes/AppRouter'; // Import AppRouter
// import { ScheduleProvider } from './context/ScheduleContext'; // ScheduleProvider likely not needed for NoExam
// Remove unused imports
//import Filter from './components/Filter/Filter.jsx'; 
//import Profile from './APP/Profile/Profile.jsx';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* AuthProvider needed for AppNavbar */}
      {/* <ScheduleProvider> */}
        {/* <AppNavbar /> */}
        {/* <Home /> */}
      {/* </ScheduleProvider> */}
      {/* <NoExam /> */}
      {/* <PendingRequestsPage /> */}
      {/* <div style={{ padding: '20px', marginTop: '20px' }}> {/* Add padding for visibility */} 
        {/* <Swap /> */} 
      {/* </div> */}
      <AppRouter /> {/* Render AppRouter, which contains BrowserRouter and all routes */}
    </AuthProvider>
  </React.StrictMode>,
)
