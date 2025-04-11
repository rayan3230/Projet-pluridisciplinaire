import React from 'react';
import ScheduleGeneratorForm from '../../components/Admin/ScheduleGeneratorForm';
import ScheduleView from '../../components/Shared/ScheduleView';

function ScheduleGenerationPage() {
  // State for selected promo, semester, generated schedule etc.
  return (
    <div>
      <h1>Generate Schedule</h1>
      <ScheduleGeneratorForm />
      <h2>Generated Schedule</h2>
      {/* <ScheduleView scheduleData={...} /> */}
    </div>
  );
}

export default ScheduleGenerationPage; 