import React, { useState, useEffect } from 'react';
// import { getPromos } from '../../services/academicService';
// import { getSemesters } from '../../services/semesterService';
// import { getTeachers } from '../../services/adminService'; // Assuming teachers are users
// import { getModulesForPromo } from '../../services/moduleService'; // Need endpoint for this
// import { generateSchedule } from '../../services/scheduleService';

function ScheduleGeneratorForm({ onScheduleGenerated }) {
  const [selectedPromo, setSelectedPromo] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [promos, setPromos] = useState([]);
  const [semesters, setSemesters] = useState([]);
  // TODO: Add state and UI for assigning teachers to modules for this specific generation request
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Promos and Semesters
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const promoData = await getPromos();
        // const semesterData = await getSemesters();
        // setPromos(promoData);
        // setSemesters(semesterData);
        setPromos([{ id: 1, name: '1st year Informatique (Mock)' }]); // Mock
        setSemesters([{ id: 1, name: 'Semester 1 2024/2025 (Mock)' }]); // Mock
      } catch (err) {
        setError('Failed to load necessary data.');
        console.error('Data fetch error:', err);
      }
    };
    fetchData();
  }, []);

  // TODO: Add logic to fetch modules for the selected promo/semester
  // TODO: Add logic to fetch available teachers
  // TODO: Add UI for mapping teachers to modules

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedPromo || !selectedSemester) {
      setError('Please select a Promo and Semester.');
      return;
    }
    // TODO: Validate that teachers are assigned

    setIsLoading(true);
    try {
      const generationParams = {
        promo_id: selectedPromo,
        semester_id: selectedSemester,
        // teacher_assignments: { moduleId1: teacherId1, moduleId2: teacherId2, ... } // Structure TBD
      };
      // const generatedSchedule = await generateSchedule(generationParams);
      console.log('Schedule generation triggered (mock)', generationParams);
      // onScheduleGenerated(generatedSchedule); // Pass generated data to parent
      alert('Schedule generation started! (Mock) Check results below.');
    } catch (err) {
      console.error('Schedule generation failed:', err);
      setError('Failed to generate schedule. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h2>Configure Schedule Generation</h2>
      <div>
        <label htmlFor="promoSelect">Promo:</label>
        <select id="promoSelect" value={selectedPromo} onChange={(e) => setSelectedPromo(e.target.value)} required>
          <option value="">-- Select Promo --</option>
          {promos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="semesterSelect">Semester:</label>
        <select id="semesterSelect" value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} required>
          <option value="">-- Select Semester --</option>
          {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Placeholder for Teacher Assignment UI */}
      <div style={{ marginTop: '1rem', border: '1px dashed gray', padding: '0.5rem' }}>
        <p><strong>Teacher Assignments:</strong></p>
        <p><em>(UI for assigning teachers to modules for this promo/semester will go here)</em></p>
        {/* Example: Fetch modules for promo/semester, list them, allow selecting teacher per module */} 
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={isLoading || promos.length === 0 || semesters.length === 0}>
        {isLoading ? 'Generating...' : 'Generate Schedule'}
      </button>
    </form>
  );
}

export default ScheduleGeneratorForm; 