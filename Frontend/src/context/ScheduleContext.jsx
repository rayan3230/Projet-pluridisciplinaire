import React, { createContext, useState, useContext } from 'react';

// Create a context for storing schedule data
const ScheduleContext = createContext(null);

// Default schedule data
const defaultScheduleData = {
    header: {
        university: "University of Science and Technology Houari Boumediene",
        department: "Vice-rectorate in charge of graduation, the continuing education et degrees",
        scheduleInfo: "",
        academicYear: "2023/2024",
        semester: "Semester 2",
    },
    timeSlots: [
        "08:00 - 09:30",
        "09:40 - 11:10",
        "11:20 - 12:50",
        "13:00 - 14:30",
        "14:40 - 16:10",
        "16:20 - 17:50"
    ],
    days: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
    courses: {
        sat: Array(6).fill(null),
        sun: Array(6).fill(null),
        mon: Array(6).fill(null),
        tue: Array(6).fill(null),
        wed: Array(6).fill(null),
        thu: Array(6).fill(null)
    }
};

// Create provider component
export const ScheduleProvider = ({ children }) => {
    const [scheduleData, setScheduleData] = useState(defaultScheduleData);

    return (
        <ScheduleContext.Provider value={{ scheduleData, setScheduleData }}>
            {children}
        </ScheduleContext.Provider>
    );
};

// Custom hook to use the schedule context
export const useSchedule = () => {
    const context = useContext(ScheduleContext);
    if (!context) {
        throw new Error('useSchedule must be used within a ScheduleProvider');
    }
    return context;
}; 