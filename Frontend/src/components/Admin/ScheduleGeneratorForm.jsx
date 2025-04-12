import React, { useState, useEffect } from 'react';
import { getPromos } from '../../services/academicService';
import { getSemesters } from '../../services/semesterService';
import { generateSchedule } from '../../services/scheduleService';

// Basic styling
const styles = {
  form: { border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '5px', backgroundColor: '#f9f9f9' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' },
  select: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px', marginBottom: '1rem' },
  button: { padding: '10px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
  disabledButton: { backgroundColor: '#ccc', cursor: 'not-allowed' },
  error: { color: 'red', marginBottom: '1rem' },
  loading: { fontStyle: 'italic' }
};

// Note: Teacher assignment selection logic is complex and omitted for now.
// It would likely involve fetching assignments based on selected promo/semester
// and displaying them, or allowing manual mapping here.

function ScheduleGeneratorForm({ onScheduleGenerated }) {
  const [selectedPromo, setSelectedPromo] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [promos, setPromos] = useState([]);
  const [semesters, setSemesters] = useState([]);
  
  const [error, setError] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch Promos and Semesters
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setError('');
      try {
        const [promoData, semesterData] = await Promise.all([
          getPromos(),
          getSemesters()
        ]);
        setPromos(promoData);
        setSemesters(semesterData);
      } catch (err) {
        setError('Failed to load necessary data (promos/semesters).');
        console.error('Data fetch error:', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // TODO: Add logic useEffect to fetch modules/assignments when promo/semester changes?

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedPromo || !selectedSemester) {
      setError('Please select a Promo and Semester.');
      return;
    }
    // TODO: Add validation for teacher assignments if required by backend

    setIsGenerating(true);
    try {
      const generationParams = {
        promo_id: selectedPromo,
        semester_id: selectedSemester,
      };
      const generatedSchedule = await generateSchedule(generationParams); // Use real API call
      
      // Pass generated data/success signal to parent
      if (onScheduleGenerated) onScheduleGenerated(generatedSchedule); 
      alert('Schedule generation request sent successfully! Check results.'); // Simple feedback

    } catch (err) {
      console.error('Schedule generation failed:', err);
      setError(err.response?.data?.error || 'Failed to generate schedule. Check backend logs for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.2em' }}>Configure Schedule Generation</h2>
      {error && <p style={styles.error}>{error}</p>}
      
      <div>
        <label htmlFor="promoSelect" style={styles.label}>Promo:</label>
        <select 
          id="promoSelect" 
          value={selectedPromo} 
          onChange={(e) => setSelectedPromo(e.target.value)} 
          required
          disabled={isLoadingData || isGenerating}
          style={styles.select}
        >
          <option value="">-- Select Promo --</option>
          {promos.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.speciality?.name || 'N/A'})</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="semesterSelect" style={styles.label}>Semester:</label>
        <select 
          id="semesterSelect" 
          value={selectedSemester} 
          onChange={(e) => setSelectedSemester(e.target.value)} 
          required
          disabled={isLoadingData || isGenerating}
          style={styles.select}
        >
          <option value="">-- Select Semester --</option>
          {semesters.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Placeholder for teacher assignment selection/display */} 
      {/* <div> ... UI to select/confirm teachers for modules ... </div> */}

      {isLoadingData && <p style={styles.loading}>Loading data...</p>}

      <button 
        type="submit" 
        disabled={isLoadingData || isGenerating}
        style={{...styles.button, ...( (isLoadingData || isGenerating) ? styles.disabledButton : {})}}
      >
        {isGenerating ? 'Generating...' : 'Generate Schedule'}
      </button>
    </form>
  );
}

export default ScheduleGeneratorForm; 