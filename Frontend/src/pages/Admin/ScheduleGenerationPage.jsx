import React, { useState, useEffect, useMemo } from 'react';
import { getPromos, getAcademicYears } from '../../services/academicService';
import { getSemesters } from '../../services/semesterService';
import { getSections } from '../../services/academicService';
import { generateClassSchedule, getCompatibleTeachers } from '../../services/scheduleService';
import ScheduleTable from '../../components/Schedule/ScheduleTable';
import './ScheduleGenerationPage.css';

const ScheduleGenerationPage = () => {
  const [promos, setPromos] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [sectionsForPromo, setSectionsForPromo] = useState([]);
  const [scheduleGenerated, setScheduleGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState(null);
  const [scheduleKey, setScheduleKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [compatibleTeachers, setCompatibleTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState(new Set());
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [requiredModules, setRequiredModules] = useState([]);
  const [generatedSectionIds, setGeneratedSectionIds] = useState(null);
  const [message, setMessage] = useState('');

  console.log('--- Rendering ScheduleGenerationPage ---');
  console.log('Current State:', {
    selectedYear: selectedAcademicYear,
    selectedSemester,
    selectedPromo,
    compatibleTeachers: compatibleTeachers.length,
    selectedTeachers: selectedTeachers.size,
    loading,
    loadingTeachers
  });

  // Fetch Promos, Semesters, and Academic Years
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingInitial(true);
      setError(null);
      try {
        const [promosRes, semestersRes, academicYearsRes] = await Promise.all([
          getPromos(),
          getSemesters(),
          getAcademicYears()
        ]);
        setPromos(promosRes);
        setSemesters(semestersRes);
        setAcademicYears(academicYearsRes);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError('Failed to load promos, semesters, or academic years. Please refresh.');
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchInitialData();
  }, []);

  // Filter semesters based on selected academic year
  const filteredSemesters = semesters.filter(semester => 
    !selectedAcademicYear || semester.academic_year?.id === parseInt(selectedAcademicYear)
  );

  // Fetch sections when promo changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!selectedPromo) {
        setSectionsForPromo([]);
        setScheduleGenerated(false);
        setGeneratedSectionIds(null);
        return;
      }
      try {
        const sections = await getSections({ promo_id: selectedPromo });
        setSectionsForPromo(sections || []);
      } catch (error) {
        console.error("Failed to fetch sections:", error);
        setError("Could not load sections for the selected promo.");
        setSectionsForPromo([]);
      }
      setScheduleGenerated(false);
      setGeneratedSectionIds(null);
    };
    fetchSections();
  }, [selectedPromo]);

  // Fetch Compatible Teachers when Promo and Semester change
  useEffect(() => {
    console.log(`Effect: Teacher fetch dependencies changed. Promo: ${selectedPromo}, Semester: ${selectedSemester}`);
    if (selectedPromo && selectedSemester) {
      console.log('Effect: Condition met, fetching teachers...');
      const fetchTeachers = async () => {
        setLoadingTeachers(true);
        setCompatibleTeachers([]);
        setSelectedTeachers(new Set());
        setError('');
        try {
          // Call service function (already has logging)
          const data = await getCompatibleTeachers(selectedPromo, selectedSemester);
          setCompatibleTeachers(data.teachers || []);
        } catch (err) {
          // Logging already in service function
          setError('Failed to fetch compatible teachers.');
          setCompatibleTeachers([]);
        } finally {
          setLoadingTeachers(false);
        }
      };
      fetchTeachers();
    } else {
      console.log('Effect: Condition NOT met for fetching teachers or clearing.');
      // Clear teachers if promo or semester is deselected or invalid
      if (compatibleTeachers.length > 0 || selectedTeachers.size > 0) { // Only clear if needed
        console.log('Effect: Clearing teachers state.');
        setCompatibleTeachers([]);
        setSelectedTeachers(new Set());
      }
    }
  }, [selectedPromo, selectedSemester]);

  // --- Sufficiency Check Logic --- 
  const { allModulesCovered, uncoveredModules } = useMemo(() => {
    // Handle edge cases where data might not be fully loaded yet
    if (requiredModules.length === 0) {
        // If no modules are required, coverage is always true
        return { allModulesCovered: true, uncoveredModules: [] }; 
    }
    if (compatibleTeachers.length === 0 && requiredModules.length > 0) {
        // If modules are required but no compatible teachers exist, they cannot be covered
        return { allModulesCovered: false, uncoveredModules: requiredModules };
    }
    if (selectedTeachers.size === 0) {
        // If teachers exist but none are selected, check if any modules are required
        return { allModulesCovered: requiredModules.length === 0, uncoveredModules: requiredModules };
    }

    // Main logic: Calculate coverage based on selected teachers
    const selectedTeacherBaseModuleIds = new Set();
    compatibleTeachers.forEach(teacher => {
      if (selectedTeachers.has(teacher.id)) {
        // Use the new 'assigned_base_module_ids' field which is a list of IDs
        teacher.assigned_base_module_ids?.forEach(moduleId => {
          selectedTeacherBaseModuleIds.add(moduleId);
        });
      }
    });

    // Find required modules whose base_module.id is NOT in the set of IDs covered by selected teachers
    const modulesNotCovered = requiredModules.filter(module => 
      !selectedTeacherBaseModuleIds.has(module.base_module.id)
    );

    return {
      allModulesCovered: modulesNotCovered.length === 0,
      uncoveredModules: modulesNotCovered // List of the actual module objects not covered
    };
  }, [selectedTeachers, compatibleTeachers, requiredModules]);

  // --- Filtered Teachers for Display --- 
  const filteredTeachers = useMemo(() => {
    if (!teacherSearchQuery) {
      return compatibleTeachers;
    }
    return compatibleTeachers.filter(teacher => 
      teacher.full_name.toLowerCase().includes(teacherSearchQuery.toLowerCase())
    );
  }, [compatibleTeachers, teacherSearchQuery]);

  const handleGenerateSchedule = async (forceOverwrite = false) => {
    // Initial checks remain the same
    if (!selectedPromo || !selectedSemester || selectedTeachers.size === 0) {
      setError('Please select year, semester, promo, and at least one teacher.');
      return;
    }
    if (!allModulesCovered && !forceOverwrite) { // Skip coverage check if forcing overwrite (already warned)
      setError('Cannot generate schedule. Not all required modules are covered by the selected teachers.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');
    // Reset generated state only if not forcing overwrite (allows display while confirming)
    if (!forceOverwrite) {
        setScheduleGenerated(false);
        setGeneratedSectionIds(null);
    }

    try {
      const teacherIdsArray = Array.from(selectedTeachers);
      // Pass the forceOverwrite flag to the service
      const response = await generateClassSchedule(selectedPromo, selectedSemester, teacherIdsArray, forceOverwrite);
      
      // --- Handle successful generation --- 
      setSuccessMessage(response.message || 'Schedule generated successfully!');
      setScheduleGenerated(true);
      setGeneratedSectionIds(response.generated_section_ids || []); 
      setScheduleKey(prevKey => prevKey + 1); 
      
    } catch (err) {
      // --- Handle potential confirmation request --- 
      if (err.response?.status === 409 && err.response?.data?.confirmation_required) {
          setError(null); // Clear previous errors before showing confirm
          if (window.confirm(err.response.data.message)) {
              // If user confirms, call again with overwrite flag set to true
              console.log('User confirmed overwrite. Retrying generation...');
              handleGenerateSchedule(true); // Recursive call with forceOverwrite = true
          } else {
              // User cancelled
              console.log('User cancelled overwrite.');
              setMessage('Schedule generation cancelled.'); // Inform user
              setLoading(false); // Ensure loading stops if cancelled
          }
      } else {
          // --- Handle other errors --- 
          const errorMsg = err.response?.data?.error || err.message || 'Failed to generate schedule.';
          setError(errorMsg);
          console.error('Schedule generation error:', err);
          setScheduleGenerated(false);
          setGeneratedSectionIds(null);
          setLoading(false); // Ensure loading stops on other errors
      }
    } finally {
      // Loading state is managed within the try/catch/confirm logic now
      // setLoading(false); // Removed from here
    }
  };

  // --- Event Handlers --- 
  const handleYearChange = (e) => {
    const value = e.target.value;
    console.log('Handler: Year changed to', value);
    setSelectedAcademicYear(value);
    setSelectedSemester(''); // Reset semester when academic year changes
  };

  const handleSemesterChange = (e) => {
    const value = e.target.value;
    console.log('Handler: Semester changed to', value);
    setSelectedSemester(value);
  };

  const handlePromoChange = (e) => {
    const value = e.target.value;
    console.log('Handler: Promo changed to', value);
    setSelectedPromo(value);
  };

  const handleTeacherSelection = (teacherId) => {
    console.log('Handler: Toggling teacher selection for ID:', teacherId);
    setSelectedTeachers(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(teacherId)) {
        newSelected.delete(teacherId);
      } else {
        newSelected.add(teacherId);
      }
      return newSelected;
    });
  };

  // Determine which sections to display tables for
  const sectionsForDisplay = useMemo(() => {
      if (!scheduleGenerated || generatedSectionIds === null) {
          // If schedule hasn't been generated successfully, show nothing or all initially fetched sections?
          // Let's default to showing nothing after an attempt unless successful.
          return []; 
      } else {
          // Filter the fetched sections to only those whose IDs are in generatedSectionIds
          return sectionsForPromo.filter(section => generatedSectionIds.includes(section.id));
      }
  }, [scheduleGenerated, generatedSectionIds, sectionsForPromo]);

  // --- JSX --- 
  return (
    <div className="admin-page-container schedule-generation-page">
      <h1>Generate Weekly Class Schedule</h1>

      {loadingInitial ? (
         <p className="admin-loading">Loading options...</p>
      ) : (
      <div className="admin-form">
            <h2>Select Promo and Semester</h2>
            {error && <p className="admin-error">{error}</p>}
            {successMessage && <p className="admin-success">{successMessage}</p>}

        <div className="form-group">
          <label htmlFor="academicYear">Academic Year:</label>
          <select
            id="academicYear"
            value={selectedAcademicYear}
            onChange={handleYearChange}
            disabled={loading || loadingTeachers}
            className="admin-select"
          >
            <option value="">Select an academic year</option>
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>
                {year.year_start}-{year.year_end}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="promo">Select Promo:</label>
          <select
            id="promo"
            value={selectedPromo}
            onChange={handlePromoChange}
            disabled={loading || loadingTeachers}
            className="admin-select"
          >
            <option value="">Select a promo</option>
            {promos.map(promo => (
              <option key={promo.id} value={promo.id}>
                {promo.name} ({promo.speciality?.name || 'No Speciality'})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="semester">Select Semester:</label>
          <select
            id="semester"
            value={selectedSemester}
            onChange={handleSemesterChange}
            disabled={loading || !selectedAcademicYear || loadingTeachers}
            className="admin-select"
          >
            <option value="">Select a semester</option>
            {filteredSemesters.map(semester => (
              <option key={semester.id} value={semester.id}>
                {semester.semester_number === 1 ? 'First Semester' : 'Second Semester'} 
                ({semester.academic_year?.year_start ?? '?'}-{semester.academic_year?.year_end ?? '?'})
              </option>
            ))}
          </select>
        </div>

        {/* Compatible Teacher Selection - Redesigned */}
        {selectedPromo && selectedSemester && (
          <div className="teacher-selection-container card-selection-container">
            <div className="card-selection-header">
              <h2>Select Compatible Teachers</h2>
              <input 
                type="text"
                placeholder="Search teachers..."
                value={teacherSearchQuery}
                onChange={e => setTeacherSearchQuery(e.target.value)}
                className="card-search-input"
                disabled={loadingTeachers}
              />
            </div>

            {/* Sufficiency Message Logic - Updated */}
            {loadingTeachers ? (
                <p></p> // No message while loading
            ) : compatibleTeachers.length > 0 && requiredModules.length > 0 ? ( 
                // Only show messages if teachers are available AND modules are required
                selectedTeachers.size === 0 ? (
                    // Specific message when no teachers are selected
                    <div className="sufficiency-message neutral"> 
                        ℹ️ Please select teachers to cover the required modules.
                    </div>
                ) : ( 
                    // Detailed coverage message ONLY when teachers ARE selected
                    <div className={`sufficiency-message ${allModulesCovered ? 'covered' : 'uncovered'}`}>
                        {allModulesCovered 
                            ? '✅ All required modules are covered by the current selection.'
                            : `⚠️ Warning: The following modules are not covered: ${uncoveredModules.map(m => m.base_module.name).join(', ')}`
                        }
                    </div>
                )
            ) : null } 

            {/* Teacher List Logic */} 
            {loadingTeachers ? (
              <p>Loading teachers...</p> 
            ) : filteredTeachers.length > 0 ? (
              <div className="card-list teacher-list">
                {filteredTeachers.map(teacher => (
                  <div key={teacher.id} className={`card-item teacher-item ${selectedTeachers.has(teacher.id) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      id={`teacher-${teacher.id}`}
                      checked={selectedTeachers.has(teacher.id)}
                      onChange={() => handleTeacherSelection(teacher.id)}
                      disabled={loading}
                    />
                    <label htmlFor={`teacher-${teacher.id}`}>{teacher.full_name}</label>
                  </div>
                ))}
              </div>
            ) : !loadingTeachers ? ( // Added !loadingTeachers check
              <p className="no-results-message">{teacherSearchQuery ? 'No teachers match your search.' : 'No compatible teachers found for this promo and semester.'}</p>
            ) : null }
          </div>
        )}

        {/* Action Button and Messages */}
        <div className="action-area">
            <button 
              onClick={() => handleGenerateSchedule(false)} // Initial call always sets overwrite to false
              disabled={loading || loadingTeachers || !selectedPromo || !selectedSemester || selectedTeachers.size === 0 || (!allModulesCovered && !loading)} 
              className="generate-button"
            >
              {loading ? 'Processing...' : 'Generate Schedule'}
            </button>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
      </div>
      )}

      {/* Generated Schedules Display - Updated */} 
      {scheduleGenerated && generatedSectionIds !== null && sectionsForDisplay.length > 0 && (
          <div className="generated-schedules-container">
              <h2>Generated Schedule(s)</h2>
              {sectionsForDisplay.map(section => (
                <div key={`${section.id}-${scheduleKey}`} className="schedule-section">
                  <h3>Section: {section.name}</h3>
                  <ScheduleTable
                    promoId={selectedPromo}
                    semesterId={selectedSemester}
                    sectionId={section.id}
                  />
                </div>
              ))}
          </div>
      )}
      {/* Optional: Message if generation was successful but no sections were generated (e.g., promo had no sections initially) */}
      {scheduleGenerated && generatedSectionIds !== null && sectionsForDisplay.length === 0 && sectionsForPromo.length > 0 && (
          <p>Schedule generated, but no entries were created for the sections in this promo.</p>
      )}
       {scheduleGenerated && generatedSectionIds !== null && sectionsForPromo.length === 0 && (
          <p>Schedule generated, but this promo has no sections defined.</p>
      )}
    </div>
  );
};

export default ScheduleGenerationPage; 