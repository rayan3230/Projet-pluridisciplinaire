import React, { useState, useEffect } from 'react';
import { getSemesters } from '../../services/semesterService';
import { getPromos, getSections } from '../../services/academicService';
import { exportScheduleToPDF, exportScheduleToExcel } from '../../services/scheduleService';
import ScheduleTable from '../../components/Schedule/ScheduleTable';


const AdminPromoScheduleViewerPage = () => {
  const [promos, setPromos] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sectionsForPromo, setSectionsForPromo] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);

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
        const sections = await getSections({ promo: selectedPromo });
        setSectionsForPromo(sections || []);
      } catch (error) {
        console.error("Failed to fetch sections:", error);
        setError("Could not load sections for the selected promo.");
        setSectionsForPromo([]);
      }
    };
    fetchSections();
  }, [selectedPromo, selectedSemester]);

  const handleExportPDF = async () => {
    if (!selectedPromo || !selectedSemester) {
      setError('Please select both promo and semester before exporting.');
      return;
    }

    setExporting(true);
    try {
      await exportScheduleToPDF(selectedPromo, selectedSemester);
    } catch (error) {
      console.error('Export to PDF error:', error);
      setError('Failed to export schedule to PDF.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedPromo || !selectedSemester) {
      setError('Please select both promo and semester before exporting.');
      return;
    }

    setExporting(true);
    try {
      await exportScheduleToExcel(selectedPromo, selectedSemester);
    } catch (error) {
      console.error('Export to Excel error:', error);
      setError('Failed to export schedule to Excel.');
    } finally {
      setExporting(false);
    }
  };

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
                {semesters
                  .filter(sem => sem.start_date && sem.end_date)
                  .map(semester => (
                  <option key={semester.id} value={semester.id}>
                    {semester.semester_number === 1 ? 'First Semester' : 'Second Semester'} 
                    ({semester.academic_year?.year_start ?? '?'}-{semester.academic_year?.year_end ?? '?'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedPromo && selectedSemester && (
            <div className="export-buttons">
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="admin-button"
              >
                {exporting ? 'Exporting...' : 'Export to PDF'}
              </button>
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="admin-button"
              >
                {exporting ? 'Exporting...' : 'Export to Excel'}
              </button>
            </div>
          )}
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
