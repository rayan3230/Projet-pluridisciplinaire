import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../config/axiosConfig'; 
import '../../styles/ExamSurveillanceSchedule.css';

function ExamSurveillanceSchedule() {
    const [academicYears, setAcademicYears] = useState([]);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedSemesterId, setSelectedSemesterId] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [schedule, setSchedule] = useState([]);
    const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSendingEmails, setIsSendingEmails] = useState(false);
    const [error, setError] = useState(null);
    const [generateStatus, setGenerateStatus] = useState(null); // For messages after generation

    // State for Modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAssignmentForDetails, setSelectedAssignmentForDetails] = useState(null);

    // Fetch academic years and semesters
    useEffect(() => {
        setIsLoadingSemesters(true);
        Promise.all([
            apiClient.get('/academic-years/'),
            apiClient.get('/semesters/'),
            apiClient.get('/users/?is_teacher=true')
        ])
            .then(([yearsResponse, semestersResponse, teachersResponse]) => {
                setAcademicYears(yearsResponse.data || []);
                setSemesters(semestersResponse.data || []);
                setTeachers(teachersResponse.data || []);
                setError(null);
            })
            .catch(err => {
                console.error("Error fetching data:", err);
                setError("Failed to load data.");
                setAcademicYears([]);
                setSemesters([]);
                setTeachers([]);
            })
            .finally(() => {
                setIsLoadingSemesters(false);
            });
    }, []);

    // Filter semesters based on selected academic year
    const filteredSemesters = semesters.filter(semester => 
        !selectedAcademicYear || semester.academic_year?.id === parseInt(selectedAcademicYear)
    );

    const handleAcademicYearChange = (e) => {
        setSelectedAcademicYear(e.target.value);
        setSelectedSemesterId('');
        setSelectedTeacherId('');
        setSchedule([]);
    };

    const handleSemesterChange = (e) => {
        setSelectedSemesterId(e.target.value);
        setSelectedTeacherId('');
        setSchedule([]);
    };

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
                // Process the response data directly without grouping
                const processedSchedule = (response.data || []).map(assignment => ({
                    ...assignment,
                    teacher_details: assignment.teacher_details || null
                }));
                console.log('Processed Schedule:', processedSchedule); // Add this for debugging
                setSchedule(processedSchedule);
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
    const handleGenerateSchedule = async () => {
        if (!selectedSemesterId) {
            setError("Please select a semester first.");
            return;
        }
        setIsGenerating(true);
        setError(null);
        setGenerateStatus(null);

        try {
            const response = await apiClient.post('/exam-surveillance/generate-schedule/', {
                semester_id: selectedSemesterId
            });
            console.log("Generation Response:", response.data);
            setGenerateStatus({ type: 'success', message: response.data.message || "Schedule generated successfully!" });
            fetchSchedule(); // Refetch the schedule with current filters
        } catch (err) {
            console.error("Error generating schedule:", err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || "An error occurred during schedule generation.";
            setGenerateStatus({ type: 'error', message: errorMessage });
            setError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendSchedules = async () => {
        if (!selectedSemesterId) {
            setError("Please select a semester first.");
            return;
        }
        setIsSendingEmails(true);
        setError(null);
        setGenerateStatus(null);

        try {
            const response = await apiClient.post('/exam-surveillance/send-schedules/', {
                semester_id: selectedSemesterId
            });
            setGenerateStatus({ 
                type: 'success', 
                message: `Successfully sent schedules to ${response.data.emails_sent} teachers!` 
            });
        } catch (err) {
            console.error("Error sending schedules:", err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || "An error occurred while sending schedules.";
            setGenerateStatus({ type: 'error', message: errorMessage });
            setError(errorMessage);
        } finally {
            setIsSendingEmails(false);
        }
    };

    // Combined loading state for UI disabling
    const isLoading = isLoadingSemesters || isLoadingTeachers || isLoadingSchedule || isGenerating || isSendingEmails;

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

    // Functions for Modal
    const handleRowClick = (assignment) => {
        setSelectedAssignmentForDetails(assignment);
        setShowDetailsModal(true);
    };

    const closeModal = () => {
        setShowDetailsModal(false);
        setSelectedAssignmentForDetails(null);
    };

    return (
        <div className="schedule-container">
            <h2>Exam Surveillance Schedule</h2>

            <div className="controls">
                <div className="form-group">
                    <label htmlFor="academic-year-select">Select Academic Year:</label>
                    <select
                        id="academic-year-select"
                        value={selectedAcademicYear}
                        onChange={handleAcademicYearChange}
                        disabled={isLoading || isSendingEmails}
                    >
                        <option value="">-- Select Academic Year --</option>
                        {academicYears.map(year => (
                            <option key={year.id} value={year.id}>
                                {year.year_start}-{year.year_end}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="semester-select">Select Semester:</label>
                    <select
                        id="semester-select"
                        value={selectedSemesterId}
                        onChange={(e) => setSelectedSemesterId(e.target.value)}
                        disabled={isLoading || !selectedAcademicYear || isSendingEmails}
                    >
                        <option value="">-- Select Semester --</option>
                        {filteredSemesters
                            .filter(sem => sem.start_date && sem.end_date)
                            .map(semester => (
                                <option key={semester.id} value={semester.id}>
                                    {semester.semester_number === 1 ? 'First Semester' : 'Second Semester'}
                                    ({semester.academic_year?.year_start ?? '?'}-{semester.academic_year?.year_end ?? '?'})
                                </option>
                            ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="teacher-select">Filter by Teacher:</label>
                    <select
                        id="teacher-select"
                        value={selectedTeacherId}
                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                        disabled={isLoading || !selectedSemesterId || isSendingEmails}
                    >
                        <option value="">-- All Teachers --</option>
                        {teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.full_name} ({teacher.scope_email})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="button-group" style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={handleGenerateSchedule} 
                        disabled={isLoading || !selectedSemesterId || isSendingEmails}
                        className="generate-button"
                    >
                        {isGenerating ? 'Generating...' : (isLoadingSchedule ? 'Loading...' : 'Generate/Regenerate Schedule')}
                    </button>

                    <button 
                        onClick={handleSendSchedules}
                        disabled={isLoading || !selectedSemesterId || isSendingEmails}
                        className="send-button"
                        style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {isSendingEmails ? 'Sending Emails...' : 'Send Schedules to Teachers'}
                    </button>
                </div>
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
                                    <th>Promo</th>
                                    <th>Speciality</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Duration (min)</th>
                                    <th>Classroom</th>
                                    <th>Assigned Teachers</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map(assignment => {
                                    const { date, time } = formatDateTime(assignment.exam?.exam_date);
                                    const promoName = assignment.exam?.section?.promo?.name || 'N/A';
                                    const specialityName = assignment.exam?.section?.promo?.speciality?.name || 'N/A';
                                    const teacherInfo = assignment.teacher_details ? (
                                        <span>
                                            <strong>{assignment.teacher_details.full_name || 'No Name'}</strong>
                                            <br/>
                                            <small>{assignment.teacher_details.scope_email}</small>
                                        </span>
                                    ) : (
                                        <span style={{color: 'orange'}}>Unassigned</span>
                                    );

                                    console.log('Assignment:', assignment); // Add this for debugging
                                    console.log('Teacher Details:', assignment.teacher_details); // Add this for debugging

                                    return (
                                        <tr key={assignment.id} onClick={() => handleRowClick(assignment)} className="clickable-row">
                                            <td>{assignment.exam?.name || 'N/A'}</td>
                                            <td>{promoName}</td>
                                            <td>{specialityName}</td>
                                            <td>{date}</td>
                                            <td>{time}</td>
                                            <td>{assignment.exam?.duration_minutes || 'N/A'}</td>
                                            <td>{assignment.exam?.classroom?.name || 'N/A'}</td>
                                            <td>{teacherInfo}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Modal for showing details */}
            {showDetailsModal && selectedAssignmentForDetails && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-button" onClick={closeModal}>×</button>
                        <h2>Assignment Details</h2>
                        <p><strong>Exam Name:</strong> {selectedAssignmentForDetails.exam?.name || 'N/A'}</p>
                        <p><strong>Module:</strong> {selectedAssignmentForDetails.exam?.module?.base_module?.name || 'N/A'} ({selectedAssignmentForDetails.exam?.module?.version_name || '-'})</p>
                        <p><strong>Promo:</strong> {selectedAssignmentForDetails.exam?.section?.promo?.name || 'N/A'}</p>
                        <p><strong>Speciality:</strong> {selectedAssignmentForDetails.exam?.section?.promo?.speciality?.name || 'N/A'}</p>
                        <p><strong>Section:</strong> {selectedAssignmentForDetails.exam?.section?.name || 'N/A'}</p>
                        <p><strong>Date:</strong> {formatDateTime(selectedAssignmentForDetails.exam?.exam_date).date}</p>
                        <p><strong>Time:</strong> {formatDateTime(selectedAssignmentForDetails.exam?.exam_date).time}</p>
                        <p><strong>Duration:</strong> {selectedAssignmentForDetails.exam?.duration_minutes || 'N/A'} minutes</p>
                        <p><strong>Classroom:</strong> {selectedAssignmentForDetails.exam?.classroom?.name || 'N/A'}</p>
                        <p><strong>Assigned Teacher:</strong> {
                            selectedAssignmentForDetails.teacher_details ? (
                                <span>
                                    {selectedAssignmentForDetails.teacher_details.full_name}
                                    <br/>
                                    <small>({selectedAssignmentForDetails.teacher_details.scope_email})</small>
                                </span>
                            ) : (
                                <span style={{color: 'orange'}}>Unassigned</span>
                            )
                        }</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExamSurveillanceSchedule; 