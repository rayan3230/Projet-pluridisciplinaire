import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../config/axiosConfig'; // <-- Corrected import path again
import '../styles/ExamSurveillanceSchedule.css'; // <-- Re-added import for the new CSS file

function ExamSurveillanceSchedule() {
    const [semesters, setSemesters] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedSemesterId, setSelectedSemesterId] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [schedule, setSchedule] = useState([]);
    const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [generateStatus, setGenerateStatus] = useState(null); // For messages after generation

    // Fetch semesters
    useEffect(() => {
        setIsLoadingSemesters(true);
        apiClient.get('/semesters/')
            .then(response => {
                setSemesters(response.data || []);
                setError(null);
            })
            .catch(err => {
                console.error("Error fetching semesters:", err);
                setError("Failed to load semesters.");
                setSemesters([]);
            })
            .finally(() => {
                setIsLoadingSemesters(false);
            });
    }, []);

    // Fetch teachers
    useEffect(() => {
        setIsLoadingTeachers(true);
        apiClient.get('/users/?is_teacher=true')
            .then(response => {
                setTeachers(response.data || []);
                setError(null);
            })
            .catch(err => {
                console.error("Error fetching teachers:", err);
                setError("Failed to load teachers.");
                setTeachers([]);
            })
            .finally(() => {
                setIsLoadingTeachers(false);
            });
    }, []);

    // Fetch schedule when selectedSemesterId or selectedTeacherId changes
    const fetchSchedule = useCallback(() => {
        if (!selectedSemesterId) {
            setSchedule([]); // Clear schedule if no semester is selected
            return;
        }
        setIsLoadingSchedule(true);
        setError(null);
        setGenerateStatus(null); // Clear generation status

        // Construct query parameters
        const params = new URLSearchParams();
        params.append('semester_id', selectedSemesterId);
        if (selectedTeacherId) {
            params.append('teacher_id', selectedTeacherId);
        }

        apiClient.get(`/exam-surveillance/?${params.toString()}`)
            .then(response => {
                setSchedule(response.data || []);
            })
            .catch(err => {
                console.error("Error fetching surveillance schedule:", err);
                setError("Failed to load surveillance schedule.");
                setSchedule([]);
            })
            .finally(() => {
                setIsLoadingSchedule(false);
            });
    }, [selectedSemesterId, selectedTeacherId]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]); // fetchSchedule already depends on IDs

    // Handle schedule generation
    const handleGenerateSchedule = () => {
        if (!selectedSemesterId) {
            setError("Please select a semester first.");
            return;
        }
        setIsGenerating(true);
        setError(null);
        setGenerateStatus(null);

        apiClient.post('/exam-surveillance/generate-schedule/', { semester_id: selectedSemesterId })
            .then(response => {
                console.log("Generation Response:", response.data);
                setGenerateStatus({ type: 'success', message: response.data.message || "Schedule generated successfully!" });
                fetchSchedule(); // Refetch the schedule with current filters
            })
            .catch(err => {
                console.error("Error generating schedule:", err);
                const errorMsg = err.response?.data?.error || "An error occurred during schedule generation.";
                setGenerateStatus({ type: 'error', message: errorMsg });
                setError(errorMsg); // Keep the error message as well
            })
            .finally(() => {
                setIsGenerating(false);
            });
    };

    // Combined loading state for UI disabling
    const isLoading = isLoadingSemesters || isLoadingTeachers || isLoadingSchedule || isGenerating;

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return { date: 'N/A', time: 'N/A' };
        try {
            const date = new Date(dateTimeString);
            return {
                date: date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
                time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
            };
        } catch (e) {
            console.error("Error formatting date:", e);
            return { date: 'Invalid Date', time: 'Invalid Time' };
        }
    };

    return (
        <div className="schedule-container">
            <h2>Exam Surveillance Schedule</h2>

            <div className="controls">
                <label htmlFor="semester-select">Select Semester:</label>
                <select
                    id="semester-select"
                    value={selectedSemesterId}
                    onChange={(e) => setSelectedSemesterId(e.target.value)}
                    disabled={isLoading}
                >
                    <option value="">-- Select Semester --</option>
                    {semesters.map(semester => (
                        <option key={semester.id} value={semester.id}>
                            {semester.name} ({new Date(semester.start_date).getFullYear()}-{new Date(semester.end_date).getFullYear()})
                        </option>
                    ))}
                </select>

                {/* Teacher Filter Dropdown */}
                <label htmlFor="teacher-select">Filter by Teacher:</label>
                <select
                    id="teacher-select"
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    disabled={isLoading || !selectedSemesterId} // Also disable if no semester selected
                >
                    <option value="">-- All Teachers --</option>
                    {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                            {teacher.full_name} ({teacher.scope_email})
                        </option>
                    ))}
                </select>

                <button onClick={handleGenerateSchedule} disabled={isLoading || !selectedSemesterId}>
                    {isGenerating ? 'Generating...' : (isLoadingSchedule ? 'Loading...' : 'Generate/Regenerate Schedule')}
                </button>
            </div>

            {generateStatus && (
                <div className={`status-message ${generateStatus.type}`}>
                    {generateStatus.message}
                </div>
            )}

            {/* Display general errors, except when a generation status is showing */}
            {error && !generateStatus && (
                 <div className="status-message error">
                     {error}
                 </div>
            )}

            {(isLoadingSchedule || isLoadingSemesters || isLoadingTeachers) && !isGenerating && <p>Loading data...</p>}

            {!isLoadingSchedule && selectedSemesterId && (
                <div className="table-container">
                    <h3>
                        Schedule for Semester {semesters.find(s => s.id === parseInt(selectedSemesterId))?.name}
                        {selectedTeacherId && teachers.find(t => t.id === parseInt(selectedTeacherId)) && (
                            <span> - Teacher: {teachers.find(t => t.id === parseInt(selectedTeacherId))?.full_name}</span>
                        )}
                    </h3>
                    {schedule.length === 0 && !error && <p>No surveillance assignments found matching the criteria.</p>}
                    {schedule.length > 0 && (
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>Exam Name</th>
                                    <th>Module</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Duration (min)</th>
                                    <th>Classroom</th>
                                    <th>Assigned Teacher</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map(assignment => {
                                    const { date, time } = formatDateTime(assignment.exam?.exam_date);
                                    return (
                                        <tr key={assignment.id}>
                                            <td>{assignment.exam?.name || 'N/A'}</td>
                                            <td>{assignment.exam?.module?.base_module?.name || 'N/A'} ({assignment.exam?.module?.version_name || '-'})</td>
                                            <td>{date}</td>
                                            <td>{time}</td>
                                            <td>{assignment.exam?.duration_minutes || 'N/A'}</td>
                                            <td>{assignment.exam?.classroom?.name || 'N/A'}</td>
                                            <td>{assignment.teacher?.full_name || <span style={{color: 'orange'}}>Unassigned</span>}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default ExamSurveillanceSchedule; 