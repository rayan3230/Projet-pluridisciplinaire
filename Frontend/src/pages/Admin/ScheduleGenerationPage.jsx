import React, { useState, useEffect, useCallback } from 'react';
import { getPromos } from '../../services/academicService';
import { getSemesters } from '../../services/semesterService';
import { getSections } from '../../services/academicService'; // Service to get sections by promo
import { generateClassSchedule } from '../../services/scheduleService'; // Import the correct generation function
import ScheduleTable from '../../components/Schedule/ScheduleTable'; // Import the new component
import './ScheduleGenerationPage.css';

const ScheduleGenerationPage = () => {
  const [promos, setPromos] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [sectionsForPromo, setSectionsForPromo] = useState([]); // Store sections for the selected promo
  const [scheduleGenerated, setScheduleGenerated] = useState(false); // Flag to show tables
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true); // Separate loading state for initial data
  const [error, setError] = useState(null);
  const [scheduleKey, setScheduleKey] = useState(0); // Add key to force re-render
  const [successMessage, setSuccessMessage] = useState(''); // For success feedback

  // Fetch Promos and Semesters
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingInitial(true);
      setError(null);
      try {
        const [promosRes, semestersRes] = await Promise.all([
          getPromos(),
          getSemesters()
        ]);
        setPromos(promosRes);
        setSemesters(semestersRes);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError('Failed to load promos or semesters. Please refresh.');
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch sections when promo changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!selectedPromo) {
        setSectionsForPromo([]);
        setScheduleGenerated(false); // Hide tables if promo changes
        return;
      }
      try {
        // Assuming getSections takes promo_id
        const sections = await getSections({ promo_id: selectedPromo }); 
        setSectionsForPromo(sections || []);
      } catch (error) {
        console.error("Failed to fetch sections:", error);
        setError("Could not load sections for the selected promo.");
        setSectionsForPromo([]);
      }
    };
    fetchSections();
  }, [selectedPromo]);

  const handleGenerateSchedule = async () => {
    if (!selectedPromo || !selectedSemester) {
      setError('Please select both promo and semester.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage('');
    setScheduleGenerated(false);

    try {
      const response = await generateClassSchedule(selectedPromo, selectedSemester);
      setSuccessMessage(response.message || 'Schedule generated successfully!');
      setScheduleGenerated(true);
    } catch (err) {
      console.error("Schedule generation error:", err);
      setError(err.response?.data?.error || 'An error occurred during schedule generation.');
      setScheduleGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container schedule-generation-page">
      <h1>Generate Weekly Class Schedule</h1>

      {/* Only show form once initial data is loaded */} 
      {loadingInitial ? (
         <p className="admin-loading">Loading options...</p>
      ) : (
      <div className="admin-form">
            <h2>Select Promo and Semester</h2>
            {error && <p className="admin-error">{error}</p>}
            {successMessage && <p className="admin-success">{successMessage}</p>}

        <div className="form-group">
          <label htmlFor="promo">Select Promo:</label>
          <select
            id="promo"
            value={selectedPromo}
                onChange={(e) => setSelectedPromo(e.target.value)}
            disabled={loading}
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
                onChange={(e) => setSelectedSemester(e.target.value)}
            disabled={loading}
            className="admin-select"
          >
            <option value="">Select a semester</option>
            {semesters.map(semester => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button
            onClick={handleGenerateSchedule}
            className="admin-button generate-button"
            disabled={loading || !selectedPromo || !selectedSemester}
          >
                {loading ? 'Generating...' : 'Generate Weekly Schedule'}
          </button>
        </div>
      </div>
      )}

      {/* Display schedule tables only after successful generation */}
      {scheduleGenerated && sectionsForPromo.length > 0 && (
        <div className="generated-schedules-container">
           <h2>Generated Schedules for Promo</h2>
           {sectionsForPromo.map(section => (
             <div key={section.id} className="section-schedule">
               <h3>Section: {section.name}</h3>
               <ScheduleTable 
                 // Use section.id as key to ensure update if section list changes
                 key={section.id} 
                 promoId={selectedPromo} 
                 semesterId={selectedSemester} 
                 sectionId={section.id} // Pass sectionId to filter
               />
             </div>
           ))}
      </div>
      )}
      {scheduleGenerated && sectionsForPromo.length === 0 && (
         <p>Schedule generated, but no sections were found for the selected promo to display.</p>
      )}
    </div>
  );
};

export default ScheduleGenerationPage; 