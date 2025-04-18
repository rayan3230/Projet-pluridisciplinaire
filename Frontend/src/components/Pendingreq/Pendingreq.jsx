import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './pendingreq.css';
import axios from 'axios';

// --- Icons ---
const SwapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-repeat icon-detail" viewBox="0 0 16 16">
        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
        <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.5A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.5z"/>
    </svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar-event icon-detail" viewBox="0 0 16 16">
        <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
    </svg>
);

// Example data structure for illustration (4 requests)
const exampleRequests = [
    {
        id: 1,
        swapWith: "Dr. Smith",
        requestDate: "15-04-2025",
        classToSwap1: "Monday 10:00 - 11:30 | Database Systems",
        classToSwap2: "Wednesday 14:00 - 15:30 | Web Development",
        studentsAffected: "Section A CS"
    },
    {
        id: 2,
        swapWith: "Prof. Johnson",
        requestDate: "16-04-2025",
        classToSwap1: "Tuesday 8:00 - 9:30 | Algorithms",
        classToSwap2: "Thursday 11:00 - 12:30 | Data Structures",
        studentsAffected: "Section B CS"
    },
    {
        id: 3,
        swapWith: "Dr. Williams",
        requestDate: "17-04-2025",
        classToSwap1: "Monday 13:00 - 14:30 | AI Fundamentals",
        classToSwap2: "Friday 9:00 - 10:30 | Machine Learning",
        studentsAffected: "Section C AI"
    },
    {
        id: 4,
        swapWith: "Prof. Brown",
        requestDate: "18-04-2025",
        classToSwap1: "Wednesday 15:00 - 16:30 | Network Security",
        classToSwap2: "Thursday 13:00 - 14:30 | Cybersecurity",
        studentsAffected: "Section A Security"
    }
];

function Pendingreq() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await axios.get('http://localhost:8000/api/swap-requests/my-requests/');
                
                // Transform the data to match our component's structure
                const transformedRequests = response.data.requests_with_ids.map(request => ({
                    id: request.id,
                    swapWith: request.requesting_teacher_name || "Unknown Teacher",
                    requestDate: new Date(request.created_at).toLocaleDateString(),
                    classToSwap1: request.requested_class,
                    classToSwap2: request.offered_class,
                    studentsAffected: request.students_affected || "Not specified"
                }));
                
                setRequests(transformedRequests);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch requests');
                setLoading(false);
                // For development, use example data if API fails
                setRequests(exampleRequests);
            }
        };

        fetchRequests();
    }, []);

    const handleEdit = async (requestId) => {
        try {
            // Add your edit logic here
            console.log("Editing request:", requestId);
        } catch (err) {
            console.error("Error editing request:", err);
        }
    };

    const handleDelete = async (requestId) => {
        try {
            // Add your delete logic here
            await axios.delete(`http://localhost:8000/api/swap-requests/${requestId}/`);
            setRequests(requests.filter(req => req.id !== requestId));
        } catch (err) {
            console.error("Error deleting request:", err);
        }
    };

    if (loading) return <div>Loading requests...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="pending-requests-container">
            <div className="pending-requests-header">
                <h3 className="title">
                    <span className="title-icon"></span> Pending requests
                </h3>
                <Link to="/pending-requests" className="see-all-link">See All</Link>
            </div>

            <div className="pending-requests-list">
                {requests.length > 0 ? (
                    requests.map((request) => (
                        <div key={request.id} className="pending-request-item">
                            <div className="request-details">
                                <div className="request-detail">
                                    <SwapIcon />
                                    <span className="detail-label">Swap with :</span>
                                    <span className="detail-value">{request.swapWith}</span>
                                </div>
                                <div className="request-detail">
                                    <CalendarIcon />
                                    <span className="detail-label">Request Date :</span>
                                    <span className="detail-value">{request.requestDate}</span>
                                </div>
                                <div className="request-detail">
                                    <span className="detail-label indented">Class to be swapped :</span>
                                    <span className="detail-value">{request.classToSwap1}</span>
                                </div>
                                <div className="request-detail">
                                    <span className="detail-label indented">Class to be swapped :</span>
                                    <span className="detail-value">{request.classToSwap2}</span>
                                </div>
                                <div className="request-detail">
                                    <span className="detail-label indented">Students Affected :</span>
                                    <span className="detail-value">{request.studentsAffected}</span>
                                </div>
                            </div>
                            <div className="request-actions">
                                <button onClick={() => handleEdit(request.id)} className="action-button edit-button">
                                    Edit Request
                                </button>
                                <button onClick={() => handleDelete(request.id)} className="action-button delete-button">
                                    Delete Request
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No pending requests.</p>
                )}
            </div>
        </div>
    );
}

export default Pendingreq;
