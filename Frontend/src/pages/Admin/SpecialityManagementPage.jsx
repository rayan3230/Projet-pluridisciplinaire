import React from 'react';
import SpecialityForm from '../../components/Admin/SpecialityForm';
// Import SpecialityList component when created

function SpecialityManagementPage() {
  return (
    <div>
      <h1>Speciality Management</h1>
      <SpecialityForm />
      {/* <SpecialityList /> */}
    </div>
  );
}

export default SpecialityManagementPage; 