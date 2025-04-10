import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import Profile from './components/Newrequest/Newrequest.jsx'
import Login from './components/Login/Login.jsx'
import { ScheduleProvider } from './context/ScheduleContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ScheduleProvider>
        {/* <Profile Name="wassim" Email="mho" Phone="000" Department="some" Year="2025" Branch="info" /> */}
        <Login />
      </ScheduleProvider>
    </BrowserRouter>
  </StrictMode>,
)
