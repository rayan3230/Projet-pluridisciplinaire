import React, { useState, useEffect } from 'react';
import { getSemesters } from '../../services/semesterService';
// Import functions to get promos and sections data
import { getPromos, getSections } from '../../services/academicService';
// Import the reusable schedule table component
import ScheduleTable from '../../components/Schedule/ScheduleTable';
// Add specific styling if needed
// import './AdminPromoScheduleViewerPage.css';

const AdminPromoScheduleViewerPage = () => {
  const [promos, setPromos] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sectionsForPromo, setSectionsForPromo] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loading, setLoading] = useState(true); // Combined loading state
  const [error, setError] = useState(null);

  // Fetch available promos and semesters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setSectionsForPromo([]); // Clear sections when fetching initial data
      try {
        const [promosData, semestersData] = await Promise.all([
          getPromos(),
          getSemesters()
        ]);
        setPromos(promosData || []);
        setSemesters(semestersData || []);
      } catch (err) {
        console.error("Failed to load promos or semesters:", err);
        setError('Could not load necessary data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch sections when promo and semester are selected
  useEffect(() => {
    const fetchSections = async () => {
      if (!selectedPromo || !selectedSemester) {
        setSectionsForPromo([]);
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
    };
    fetchSections();
  }, [selectedPromo, selectedSemester]);

  return (
    <div className="admin-page-container promo-schedule-viewer-page">
      <h1>View Promo Schedules</h1>
      {error && <p className="admin-error">{error}</p>}

      {loading ? (
        <p className="admin-loading">Loading options...</p>
      ) : (
        <div className="controls-container admin-form" style={{ marginBottom: '20px' }}>
           <h2>Select Promo and Semester</h2>
          <div className="form-row">
            <div className="form-group form-group-half">
              <label htmlFor="promoSelect">Select Promo:</label>
              <select
                id="promoSelect"
                value={selectedPromo}
                onChange={(e) => setSelectedPromo(e.target.value)}
                disabled={promos.length === 0}
                className="admin-select"
              >
                <option value="">-- Select Promo --</option>
                {promos.map(promo => (
                  <option key={promo.id} value={promo.id}>
                    {promo.name} ({promo.speciality?.name || 'No Speciality'})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group form-group-half">
              <label htmlFor="semesterSelect">Select Semester:</label>
              <select
                id="semesterSelect"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={semesters.length === 0}
                className="admin-select"
              >
                <option value="">-- Select Semester --</option>
                {semesters.map(semester => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Display the schedule tables if selections are made */}
      <div className="generated-schedules-container">
        {selectedPromo && selectedSemester && sectionsForPromo.length > 0 && (
          <>
            <h2>Schedules for Selected Promo & Semester</h2>
            {sectionsForPromo.map(section => (
              <div key={section.id} className="section-schedule">
                <h3>Section: {section.name}</h3>
                <ScheduleTable
                  key={`${selectedSemester}-${selectedPromo}-${section.id}`}
                  promoId={selectedPromo}
                  semesterId={selectedSemester}
                  sectionId={section.id} 
                />
              </div>
            ))}
          </>
        )}
         {selectedPromo && selectedSemester && sectionsForPromo.length === 0 && !loading && (
           <p>No sections found (or no schedule generated yet) for this Promo/Semester combination.</p>
         )}
         {!selectedPromo || !selectedSemester && !loading && (
            <p>Please select a Promo and Semester to view schedules.</p>
         )}
      </div>
    </div>
  );
};

export default AdminPromoScheduleViewerPage;
