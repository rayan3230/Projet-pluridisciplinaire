import React from 'react';
import SemesterForm from '../../components/Admin/SemesterForm';
// Import SemesterList/Management component when created

function SemesterManagementPage() {
  return (
    <div>
      <h1>Semester Management</h1>
      <SemesterForm />
      {/* <SemesterManagementComponent /> */}
    </div>
  );
}

export default SemesterManagementPage; 