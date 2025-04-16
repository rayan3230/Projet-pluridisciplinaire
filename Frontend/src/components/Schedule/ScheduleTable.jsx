import React, { useState, useEffect } from 'react';
import { getScheduleEntries } from '../../services/scheduleService';
import './ScheduleTable.css';

// Define days and time slots to match backend generation
const DAYS = [
  { id: 6, name: 'Sat' },
  { id: 7, name: 'Sun' },
  { id: 1, name: 'Mon' },
  { id: 2, name: 'Tue' },
  { id: 3, name: 'Wed' },
  { id: 4, name: 'Thu' },
  // Add Friday if needed: { id: 5, name: 'Fri' },
];

// Match backend time slots for display
const TIME_SLOTS = [
  { start: '08:00', end: '09:30' },
  { start: '09:40', end: '11:10' },
  { start: '11:20', end: '12:50' },
  { start: '13:00', end: '14:30' },
  { start: '14:40', end: '16:10' },
  { start: '16:20', end: '17:50' },
];

const ScheduleTable = ({ promoId, semesterId, sectionId, teacherId }) => {
  const [scheduleData, setScheduleData] = useState({}); // Store processed data: { 'day_startTime': entry }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!semesterId) {
        setScheduleData({}); // Clear data if no semester
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const filters = { semester_id: semesterId };
        // Only apply promo_id filter if we're not showing a specific section
        if (promoId && !sectionId) filters.promo_id = promoId;
        if (sectionId) filters.section_id = sectionId;
        if (teacherId) filters.teacher_id = teacherId;

        const entries = await getScheduleEntries(filters);

        // Process entries into a lookup map for easy rendering
        const processedData = {};
        entries.forEach(entry => {
          // Ensure start_time is formatted consistently (HH:MM)
          const startTimeFormatted = entry.start_time.substring(0, 5);
          const key = `${entry.day_of_week}_${startTimeFormatted}`;
          // If multiple entries land in the same slot (e.g., different sections), handle appropriately.
          // For now, just overwrite (assuming admin view shows one section or filters apply)
          processedData[key] = entry;
        });
        setScheduleData(processedData);

      } catch (err) {
        console.error("Failed to fetch schedule entries:", err);
        setError('Could not load schedule data.');
        setScheduleData({}); // Clear data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [promoId, semesterId, sectionId, teacherId]); // Re-fetch when props change

  if (isLoading) {
    return <p className="admin-loading">Loading schedule...</p>;
  }

  if (error) {
    return <p className="admin-error">{error}</p>;
  }

  // Render the table only if semesterId is provided
  if (!semesterId) {
    return <p>Please select a Semester to view the schedule.</p>;
  }

  return (
    <div className="schedule-table-container">
      <table className="schedule-table">
        <thead>
          <tr><th className="time-slot-header">TIME / DAY</th>{DAYS.map(day => (
              <th key={day.id}>{day.name}</th>
            ))}</tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map(slot => (
            <tr key={slot.start}><td className="time-slot-header">
                <div className="time-text">
                  <span>{slot.start}</span>
                  <span>-</span>
                  <span>{slot.end}</span>
                </div>
              </td>{DAYS.map(day => {
                const slotKey = `${day.id}_${slot.start}`;
                const entry = scheduleData[slotKey];
                return (
                  <td key={`${day.id}-${slot.start}`} className={`schedule-cell ${entry ? 'has-entry' : ''}`}>
                    {entry ? (
                      <div className="schedule-entry">
                        <span className="entry-module">
                           {entry.module?.base_module?.name || 'Module?'} ({entry.entry_type})
                        </span>
                        {!teacherId && <span className="entry-teacher">{entry.teacher_details?.full_name || 'Teacher?'}</span>}
                        <span className="entry-classroom">{entry.classroom?.name || 'Room?'}</span>
                        {!sectionId && <span className="entry-section">Sec: {entry.section?.name || '?'}</span>} 
                      </div>
                    ) : (
                      ''
                    )}
                  </td>
                );
              })}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;