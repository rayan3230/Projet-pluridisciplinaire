import React, { useState } from 'react';
// Use the actual service function
import { createUser } from '../../services/adminService'; 
import { useAuth } from '../../context/AuthContext'; // To ensure only admin sees this

function UserCreateForm() {
  const { isAdmin } = useAuth(); // Get admin status
  const [fullName, setFullName] = useState('');
  const [personnelEmail, setPersonnelEmail] = useState('');
  const [isTeacher, setIsTeacher] = useState(true); // Default to creating a teacher
  const [isAdminRole, setIsAdminRole] = useState(false); // Option to create admin
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const userData = {
        full_name: fullName,
        personnel_email: personnelEmail,
        is_teacher: isTeacher,
        is_admin: isAdminRole,
        // username: username, // Include if using username
    };

    try {
      const response = await createUser(userData);
      // Backend generates scope_email and password, sends email
      setSuccess(`User ${response.full_name} (${response.scope_email}) created successfully! Credentials sent to ${response.personnel_email}.`);
      console.log('User creation successful:', response);
      // Clear form
      setFullName('');
      // setUsername('');
      setPersonnelEmail('');
      setIsTeacher(true); // Reset to default
      setIsAdminRole(false);
    } catch (err) {
      console.error('User creation failed:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'User creation failed. Please check the details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Only render the form if the logged-in user is an admin
  if (!isAdmin) {
    return <p>You do not have permission to create users.</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h2>Create New User</h2>
      <div>
        <label htmlFor="fullName">Full Name:</label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="personnelEmail">Personnel Email (for sending credentials):</label>
        <input
          type="email"
          id="personnelEmail"
          value={personnelEmail}
          onChange={(e) => setPersonnelEmail(e.target.value)}
          required
        />
      </div>
      <div>
          <label>
              <input 
                type="checkbox" 
                checked={isTeacher} 
                onChange={(e) => setIsTeacher(e.target.checked)}
              />
              Assign Teacher Role?
          </label>
      </div>
       <div>
          <label>
              <input 
                type="checkbox" 
                checked={isAdminRole} 
                onChange={(e) => setIsAdminRole(e.target.checked)}
              />
              Assign Admin Role? (Use with caution)
          </label>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating User...' : 'Create User'}
      </button>
    </form>
  );
}

export default UserCreateForm; 