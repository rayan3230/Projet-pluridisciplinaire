import React from 'react';
import ClassForm from '../../components/Admin/ClassForm';
// Import ClassList component when created

function ClassManagementPage() {
  return (
    <div>
      <h1>Class Management</h1>
      <ClassForm />
      {/* <ClassList /> */}
    </div>
  );
}

export default ClassManagementPage; 