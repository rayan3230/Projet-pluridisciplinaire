import './Login.css'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/Group 1.png';
import topright from '../../assets/topright.png';
import bottomleft from '../../assets/bottomleft.png';
import bottomright from '../../assets/bottomright.png';
import google from '../../assets/google.png';
//import bottomright2 from './assets/Vector 2.png';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Component Mode: 'login' or 'forceChangePassword'
    const [mode, setMode] = useState('login');

    // State for login form
    const [loginFormData, setLoginFormData] = useState({
        scope_email: '',
        password: '' // This will hold the temporary password initially
    });

    // State for force change password form
    const [tempPassword, setTempPassword] = useState(''); // To store the successful temp password
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // General UI state
    const [message, setMessage] = useState('');
    const [error, setError] = useState(''); // Specific error state
    const [isLoading, setIsLoading] = useState(false);

    // State to store user data after initial successful login
    const [initialUserData, setInitialUserData] = useState(null);

    // State for password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // --- LOGIN FORM HANDLER ---
    const handleLoginSubmit = async (event) => {
      event.preventDefault();
      setIsLoading(true);
      setMessage('');
      setError('');
      setInitialUserData(null); // Clear previous user data
      
      try {
          console.log('Attempting login with:', loginFormData);
          const response = await apiClient.post('/auth/login/', loginFormData);
          
          console.log('Login response:', response.data);
          const userData = response.data.user;

          // Call context login - primarily useful if not changing password immediately
          login(userData);
          
          if (userData?.needs_password_change) {
              // --- Needs Password Change ---
              setMessage('Login successful! Please set your new password.');
              // Store the temporary password that worked
              setTempPassword(loginFormData.password);
              // Store the received user data before changing mode
              setInitialUserData(userData);
              // Switch mode to show password change fields
              setMode('forceChangePassword');
          } else {
              // --- Login OK, No Change Needed ---
              setMessage('Login successful!');
              // Navigate based on role (context now has full user data)
              if (userData?.is_admin) {
                  navigate('/admin/dashboard', { replace: true });
              } else if (userData?.is_teacher) {
                  navigate('/teacher/dashboard', { replace: true });
              } else {
                  navigate('/', { replace: true }); // Fallback
              }
          }
          
      } catch (err) {
          console.error('Login error details:', {
              message: err.message,
              response: err.response?.data,
              status: err.response?.status
          });
          const errorDetail = err.response?.data?.detail || err.response?.data?.message || 'Failed to sign in. Please check your credentials.';
          setError(errorDetail); // Use setError state
          setMessage(''); // Clear general message
      } finally {
          setIsLoading(false);
      }
    };
  
    // --- CHANGE PASSWORD FORM HANDLER ---
    const handleChangePasswordSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setError('New password must be at least 8 characters long.');
            setIsLoading(false);
            return;
        }

        // Check if we have the initial user data needed
        if (!initialUserData) {
            setError('User data lost. Please try logging in again.');
            setMode('login'); // Go back to login mode
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                // Use the initial user data email
                scope_email: initialUserData.scope_email, 
                current_password: tempPassword, 
                new_password: newPassword
            };
            await apiClient.post('/change-password/', payload, { baseURL: 'http://localhost:8000/'}); 

            setMessage('Password changed successfully! Redirecting...');
            console.log('Password change successful');

            // Construct the updated user object using stored initial data
            const updatedUser = { 
                ...initialUserData, // Spread initial data (id, name, roles etc.)
                needsPasswordChange: false // Set the flag to false
            };
            // Call the login function from context (obtained at top level)
            login(updatedUser); 

            // Redirect after delay
            setTimeout(() => {
                // Use updatedUser data directly for navigation check
                if (updatedUser?.is_admin) {
                    navigate('/admin/dashboard', { replace: true });
                } else if (updatedUser?.is_teacher) {
                    navigate('/teacher/dashboard', { replace: true });
                } else {
                    navigate('/', { replace: true }); 
                }
            }, 2000); 

        } catch(err) {
            console.error('Password change failed:', err.response?.data || err.message);
            if (err.response?.status === 404) {
                 setError('Password change endpoint not found (404). Please check backend URL configuration.');
            } else {
                 setError(err.response?.data?.detail || 'Password change failed. Please try again.');
            }
            // Keep user in password change mode on failure
        } finally {
            setIsLoading(false);
        }
    };

    // --- Input Change Handlers ---
    const handleLoginChange = (e) => {
      setLoginFormData({
          ...loginFormData,
          [e.target.name]: e.target.value
      });
    };

    return <>
      <div className="container">
       
        <div id="left">
          <div>
              <img id="logo" src={logo} alt="Logo" />
          </div>
          
              <img id="topright" src={topright} alt="" />
              <img id="bottomleft" src={bottomleft} alt="" />
              <img id="bottomright" src={bottomright} alt="" />
        </div>
        <div id="right">
          <h1 id='welcome'>Welcome to Scope</h1>
          <p id='description'>SCOPE allows professors to securely swap class slots with mutual approval, ensuring transparency, minimizing conflicts, and providing real-time updates.</p>
          
          <button type="button" id='google'>
            <img src={google} alt="google logo" />
            <span>Continue with google</span>
          </button>

          {/* Mode-dependent UI */}
          {mode === 'login' && (
            <>
              <form onSubmit={handleLoginSubmit}>
                <input 
                  type="email" 
                  name='scope_email' 
                  placeholder="Enter Scope Email..." 
                  value={loginFormData.scope_email} 
                  onChange={handleLoginChange}
                  required
                  disabled={isLoading}
                />
                {/* Password input container */}
                <div className='password-container' style={{ position: 'relative', marginBottom: '15px' }}> 
                  <input 
                    type="password" 
                    name='password'
                    placeholder="Enter Password..." 
                    value={loginFormData.password}
                    onChange={handleLoginChange}
                    required
                    disabled={isLoading}
                    style={{ boxSizing: 'border-box' }} 
                  />
                </div>
                {/* Forgot Password Link (moved outside password-container) */} 
                <p>
                    <a href="#" className="textbut">Forgot Password?</a>
                </p>
                
                {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
                {message && <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>{message}</p>}
                
                <button type="submit" id='submit' disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
                <p >
                Can't sign in? Try <a href="#" className="textbut">resetting your password</a> or <a href="#" className="textbut">contact us</a> for assistance.
                </p>
              </form>
            </>
          )}

          {mode === 'forceChangePassword' && (
            <>
              <h2>Set Your New Password</h2>
              <p>Please choose a new password for your account ({loginFormData.scope_email}).</p>
              <form onSubmit={handleChangePasswordSubmit}>
                <div className='password-container' style={{ position: 'relative', marginBottom: '15px' }}>
                    <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '5px' }}>New Password:</label>
                    <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ paddingRight: '80px', boxSizing: 'border-box', width: '100%' }}
                    />
                    <div style={{ 
                      position: 'absolute', 
                      right: '10px', 
                      top: 'calc(50% + 10px)', 
                      transform: 'translateY(-50%)', 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                        <input 
                            type="checkbox" 
                            id="showNewPasswordCheck" 
                            checked={showNewPassword} 
                            onChange={() => setShowNewPassword(!showNewPassword)} 
                            disabled={isLoading}
                            style={{ 
                              margin: 0,
                              cursor: 'pointer',
                              accentColor: '#4CAF50'
                            }}
                        />
                        <label 
                          htmlFor="showNewPasswordCheck" 
                          style={{ 
                            fontSize: '0.9em',
                            color: '#666',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          Show
                        </label>
                    </div>
                 </div>
                 <div className='password-container' style={{ position: 'relative', marginBottom: '15px' }}>
                    <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>Confirm New Password:</label>
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ paddingRight: '80px', boxSizing: 'border-box', width: '100%' }}
                    />
                    <div style={{ 
                      position: 'absolute', 
                      right: '10px', 
                      top: 'calc(50% + 10px)', 
                      transform: 'translateY(-50%)', 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                        <input 
                            type="checkbox" 
                            id="showConfirmPasswordCheck" 
                            checked={showConfirmPassword} 
                            onChange={() => setShowConfirmPassword(!showConfirmPassword)} 
                            disabled={isLoading}
                            style={{ 
                              margin: 0,
                              cursor: 'pointer',
                              accentColor: '#4CAF50'
                            }}
                        />
                        <label 
                          htmlFor="showConfirmPasswordCheck" 
                          style={{ 
                            fontSize: '0.9em',
                            color: '#666',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          Show
                        </label>
                    </div>
                 </div>
                 
                {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
                {message && <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>{message}</p>}
                
                <button type="submit" id='submit-new-password' disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Set New Password'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
      </>
}

export default Login