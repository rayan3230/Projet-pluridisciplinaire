import React from 'react';
import UserCreateForm from '../../components/Admin/UserCreateForm';
// Import UserList component when created

function UserManagementPage() {
  return (
    <div>
      <h1>User Management</h1>
      <UserCreateForm />
      {/* <UserList /> */}
    </div>
  );
}

export default UserManagementPage; 