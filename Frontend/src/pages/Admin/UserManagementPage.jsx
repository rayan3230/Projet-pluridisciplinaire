import React, { useState, useEffect } from 'react';
import {
  getUsers, 
  deleteUser
  // updateUser handled by form
} from '../../services/adminService'; // Assuming service file
import UserCreateForm from '../../components/Admin/UserCreateForm';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getUsers(); 
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError('Could not load users. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClick = () => {
    setEditingUser(null);
    setShowForm(true);
  }

  const handleEditClick = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        fetchData();
      } catch (err) {
        console.error("Failed to delete user:", err);
        setError('Failed to delete user.');
      }
    }
  };

  const handleFormSubmitSuccess = () => {
    setShowForm(false); 
    setEditingUser(null);
    fetchData(); 
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <div className="admin-page-container user-management-page"> {/* Added specific class */}
      <h1>Manage Users</h1>
      {error && <p className="admin-error">{error}</p>}

      {!showForm && (
        <button 
          onClick={handleAddClick} 
          className="admin-button add-button"
        >
          Add New User
        </button>
      )}

      {showForm && (
        <UserCreateForm 
          onSubmitSuccess={handleFormSubmitSuccess} 
          initialData={editingUser}
          onCancel={handleCancel}
        />
      )}

      <h2>Existing Users</h2>
      {isLoading ? (
        <p className="admin-loading">Loading users...</p>
      ) : users.length === 0 && !error ? (
        <p>No users found.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Scope Email</th>
                <th>Personnel Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.full_name || '-'}</td>
                  <td>{user.scope_email}</td>
                  <td>{user.personnel_email || '-'}</td>
                  <td>
                    {user.is_superuser ? 'Superuser' : 
                     user.is_staff ? 'Admin' : 
                     user.is_teacher ? 'Teacher' : 'Student'}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="admin-button edit-button"
                        disabled={showForm}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(user.id)} 
                        className="admin-button delete-button"
                        disabled={showForm}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserManagementPage; 