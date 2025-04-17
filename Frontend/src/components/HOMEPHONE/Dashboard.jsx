import React from 'react';
import { FaCalendarAlt, FaExchangeAlt, FaBell, FaQuestionCircle } from 'react-icons/fa';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <h1 className="dashboard-title">
        Manage your schedule, propose slot exchanges and track approvals easily.
      </h1>

      <div className="menu-options">
        <button className="menu-button">
          <FaCalendarAlt className="button-icon" />
          <span>View your schedule</span>
        </button>

        <button className="menu-button">
          <FaExchangeAlt className="button-icon" />
          <span>Browse requests</span>
        </button>

        <button className="menu-button">
          <FaBell className="button-icon" />
          <span>Quick Actions</span>
        </button>
      </div>

      <div className="help-center">
        <div className="help-header">
          <h2>Help Center</h2>
          <FaQuestionCircle className="help-icon" />
        </div>
        <div className="help-buttons">
          <button className="help-button">Contact Admin</button>
          <button className="help-button">FAQs</button>
          <button className="help-button">Suggest an Improvement</button>
        </div>
      </div>

      <div className="mission">
        <h3>Our Mission</h3>
        <p>To simplify academic scheduling by providing an intuitive tool that enhances collaboration and efficiency.</p>
      </div>
    </div>
  );
}

export default Dashboard; 