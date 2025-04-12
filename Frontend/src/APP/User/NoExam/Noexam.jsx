import React from 'react';
import AppNavbar from '../../../components/Appnavbar/AppNavbar.jsx'; // Adjust path if needed
import './noexam.css'; // Import CSS

function NoExam() {
    return (
        <div className="noexam-page-container">
            <AppNavbar />
            <div className="noexam-content-area">
                <div className="noexam-card">
                    <h2 className="noexam-title">Exams</h2>
                    <div className="noexam-message-content">
                        <p className="noexam-message">
                            The exams schedule isn't available yet. 
                            Please check back later once it's published.
                        </p>
                        <p className="noexam-thanks">
                            Thanks for your patience and understanding.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NoExam;

