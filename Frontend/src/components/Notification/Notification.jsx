import React, { useState } from 'react';
import './notification.css';

// --- Placeholder Icons (Replace with actual icons or library) ---
const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);
const PendingIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);
const ScheduleIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
       <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);
const ProfileIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
         <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
    </svg>
);
// --- End Placeholder Icons ---

// --- Dummy Data ---
const dummyNotifications = [
    {
        id: 1, type: 'request_accepted', category: 'Requests',
        avatarInitial: 'T', avatarColor: '#20c997', // Teal
        actor: 'Teacher 1', actionText: 'accepted your swap request',
        timestamp: '1h ago', isRead: false, statusIcon: <CheckIcon />
    },
    {
        id: 2, type: 'request_received', category: 'Requests',
        avatarInitial: 'N', avatarColor: '#dc3545', // Red
        actor: 'Teacher 1', actionText: 'Sent your swap request',
        timestamp: '1h ago', isRead: false, statusIcon: <PendingIcon />,
        showActions: true // Flag to show approve/decline
    },
    {
        id: 3, type: 'schedule_update', category: 'Schedule',
        text: 'Your weekly schedule was updated', 
        timestamp: '1h ago', isRead: false, tagIcon: <ScheduleIcon />
    },
    {
        id: 4, type: 'schedule_update', category: 'Schedule',
        text: 'Your Temporary schedule swap has ended', 
        timestamp: '1h ago', isRead: true, tagIcon: <ScheduleIcon />
    },
    {
        id: 5, type: 'schedule_created', category: 'Schedule',
        text: 'Your schedule for the semester has been created!', 
        timestamp: '1h ago', isRead: true, tagIcon: <ScheduleIcon />
    },
    {
        id: 6, type: 'schedule_temporary', category: 'Schedule',
        text: 'Your weekly schedule was temporary updated', 
        timestamp: '1h ago', isRead: true, tagIcon: <ScheduleIcon />
    },
    {
        id: 7, type: 'profile_update', category: 'Profile', // Added Profile category
        text: 'Your profile was successfully updated!', 
        timestamp: '1h ago', isRead: true, tagIcon: <ProfileIcon />
    },
];
// --- End Dummy Data ---


function Notification() {
    const [activeTab, setActiveTab] = useState('All');

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    // Filter notifications based on active tab
    const filteredNotifications = activeTab === 'All' 
        ? dummyNotifications
        : dummyNotifications.filter(n => n.category === activeTab);

    const renderNotificationItem = (notification) => {
        const tagClass = `tag-${notification.category?.toLowerCase() || 'default'}`;
        const pendingTagClass = notification.type === 'request_received' ? 'tag-pending' : '';

        return (
            <li key={notification.id} className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}>
                {notification.avatarInitial && (
                    <div className="notification-avatar" style={{ backgroundColor: notification.avatarColor }}>
                        {notification.avatarInitial}
                    </div>
                )}
                <div className="notification-content">
                    <div className="notification-text">
                        {notification.actor && <strong>{notification.actor}</strong>}
                        {notification.actionText && ` ${notification.actionText}`}
                        {notification.text && notification.text}
                        {notification.statusIcon && <span className="status-icon">{notification.statusIcon}</span>}
                    </div>
                    <div className="notification-meta">
                        <span className="timestamp">{notification.timestamp}</span>
                        <span className={`notification-tag ${tagClass}`}>
                            {notification.tagIcon}{notification.category}
                        </span>
                        {pendingTagClass && 
                            <span className={`notification-tag ${pendingTagClass}`}>Pending</span>
                        }
                    </div>
                    {notification.showActions && (
                        <div className="notification-actions">
                            <button className="approve-button">Approve</button>
                            <button className="decline-button">Decline</button>
                        </div>
                    )}
                </div>
            </li>
        );
    };

    return (
        <div className="notification-popup">
            <div className="notification-header">
                <h2>Notifications</h2>
            </div>
            <div className="notification-tabs">
                <button 
                    className={`tab-item ${activeTab === 'All' ? 'active' : ''}`}
                    onClick={() => handleTabClick('All')}
                >
                    All
                </button>
                <button 
                    className={`tab-item ${activeTab === 'Requests' ? 'active' : ''}`}
                    onClick={() => handleTabClick('Requests')}
                >
                    Requests
                </button>
                <button 
                    className={`tab-item ${activeTab === 'Schedule' ? 'active' : ''}`}
                    onClick={() => handleTabClick('Schedule')}
                >
                    Schedule
                </button>
                {/* Add other tabs if needed */}
            </div>
            <ul className="notification-list">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map(renderNotificationItem)
                ) : (
                    <li className="no-notifications">No notifications found.</li>
                )}
            </ul>
        </div>
    );
}

export default Notification;
