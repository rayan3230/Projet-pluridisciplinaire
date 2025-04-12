import React, { useRef, useState } from 'react';
import './TeacherSchedule.css';
import * as XLSX from 'xlsx';
import { useSchedule } from '../../context/ScheduleContext';

// --- Placeholder Download Icon ---
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);
// --- End Placeholder Icon ---

const TeacherSchedule = () => {
    const { scheduleData } = useSchedule();

    const getCellContent = (dayIndex, slotIndex) => {
        const day = scheduleData.days[dayIndex].toLowerCase();
        const course = scheduleData.courses[day][slotIndex];
        if (course) {
            return (
                <div className="course-info">
                    <div className="course-name">{course.name}</div>
                    <div className="course-details">
                        <span className="course-type">{course.type}</span>
                        <span className="course-room">{course.room}</span>
                    </div>
                    <div className="course-professor">{course.professor}</div>
                </div>
            );
        }
        return null;
    };

    const getCellContentForExcel = (dayIndex, slotIndex) => {
        const day = scheduleData.days[dayIndex].toLowerCase();
        const course = scheduleData.courses[day][slotIndex];
        if (course) {
            return `${course.name}\n${course.type}\n${course.room}\n${course.professor}`;
        }
        return '[Empty]'; // Special marker for empty cells
    };

    const exportToExcel = () => {
        const wsData = [
            ['UNIVERSITY:', scheduleData.header.university],
            ['DEPARTMENT:', scheduleData.header.department],
            ['', ''],
            ['EDITABLE FIELDS:', ''],
            ['Academic Year:', scheduleData.header.academicYear],
            ['Semester:', scheduleData.header.semester],
            ['Section:', scheduleData.header.scheduleInfo.split('Section:')[1]?.trim() || 'B'],
            ['', ''],
            ['HOW TO ADD COURSES:', 'Replace [Empty] with course information in this format:'],
            ['', 'Course Name', '', 'Example:'],
            ['', 'Course Type', '', 'Software Engineering'],
            ['', 'Room Number', '', 'Lecture'],
            ['', 'Professor Name', '', 'Room 101'],
            ['', '', '', 'Dr. Smith'],
            ['', ''],
            ['Time', ...scheduleData.days]
        ];

        scheduleData.timeSlots.forEach((timeSlot, slotIndex) => {
            const row = [timeSlot];
            for (let dayIndex = 0; dayIndex < scheduleData.days.length; dayIndex++) {
                row.push(getCellContentForExcel(dayIndex, slotIndex));
            }
            wsData.push(row);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        ws['!cols'] = [
            { wch: 15 },
            ...Array(scheduleData.days.length).fill({ wch: 25 })
        ];
        ws['!rows'] = Array(wsData.length).fill({ hpt: 30 });

        XLSX.utils.book_append_sheet(wb, ws, "Schedule");
        XLSX.writeFile(wb, 'schedule.xlsx');
    };

    return (
        <div className="teacher-schedule-card">
            <div className="card-header">
                <div className="schedule-info">
                    <div className="schedule-date">{scheduleData?.header?.scheduleInfo || 'Loading schedule info...'}</div>
                    <h2 className="schedule-title">Teacher schedule</h2>
                </div>
                <div className="schedule-actions">
                    <button className="export-button" onClick={exportToExcel}>
                        <DownloadIcon />
                        Export Excel
                    </button>
                </div>
            </div>
            
            <div className="schedule-table">
                <div className="time-slots">
                    <div className="time-slot-header">Time</div>
                    {scheduleData?.timeSlots?.map((slot, index) => (
                        <div key={index} className="time-slot">
                            <span className="time-text">{slot}</span>
                        </div>
                    ))}
                </div>
                
                <div className="schedule-grid">
                    <div className="days-row">
                        {scheduleData?.days?.map((day, index) => (
                            <div key={index} className="day-header">
                                <span className="day-text">{day}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="schedule-cells">
                        {scheduleData?.days?.map((_, dayIndex) => (
                            <div key={dayIndex} className="day-column">
                                {scheduleData?.timeSlots?.map((_, slotIndex) => (
                                    <div key={slotIndex} className="schedule-cell">
                                        {scheduleData?.courses && scheduleData?.days && scheduleData?.timeSlots && getCellContent(dayIndex, slotIndex)}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherSchedule; 