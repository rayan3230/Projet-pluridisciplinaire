import React from 'react';
import VersionModuleForm from '../../components/Admin/VersionModuleForm';
// Import VersionModuleList component when created

function VersionModuleManagerPage() {
  return (
    <div>
      <h1>Version Module Management</h1>
      <VersionModuleForm />
      {/* <VersionModuleList /> */}
    </div>
  );
}

export default VersionModuleManagerPage; 