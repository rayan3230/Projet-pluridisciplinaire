import './Login.css'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/circle.png';
import topright from '../../assets/topright.png';
import bottomleft from '../../assets/bottomleft.png';
import bottomright from '../../assets/bottomright.png';
import google from '../../assets/google.png';
//import bottomright2 from './assets/Vector 2.png';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // State for login form (using formData now)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Component Mode: 'login' or 'forceChangePassword'
    const [mode, setMode] = useState('login');

    // State for force change password form (re-added from LoginOld)
    const [tempPassword, setTempPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // General UI state
    const [message, setMessage] = useState('');
    const [error, setError] = useState(''); // Specific error state
    const [isLoading, setIsLoading] = useState(false);

    // State to store user data after initial successful login
    const [initialUserData, setInitialUserData] = useState(null);

    // State for password visibility (only for new/confirm password)
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // --- LOGIN FORM HANDLER ---
    const handleLoginSubmit = async (event) => {
      event.preventDefault();
      setIsLoading(true);
      setMessage('');
      setError('');
      setInitialUserData(null); // Clear previous user data
      
      // Adapt to use formData from the new state
      const loginPayload = {
          scope_email: formData.email, // Use formData.email
          password: formData.password    // Use formData.password
      };

      try {
          console.log('Attempting login with:', loginPayload);
          const response = await apiClient.post('/users/auth/login/', loginPayload);
          
          console.log('Login response:', response.data);
          const userData = response.data.user;

          // Call context login - primarily useful if not changing password immediately
          login(userData);
          
          if (userData?.needs_password_change) {
              // --- Needs Password Change ---
              setMessage('Login successful! Please set your new password.');
              // Store the temporary password that worked
              setTempPassword(formData.password); // Use formData.password
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
    const handleChange = (e) => {
      setFormData({
          ...formData,
          [e.target.name]: e.target.value
      });
    };

    // New handleSubmit to call the original login logic
    const handleSubmit = (event) => {
        handleLoginSubmit(event); // Call the existing login submission logic
    };

    useEffect(() => {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/typed.js@2.1.0/dist/typed.umd.js";
      script.async = true;
      
      script.onload = () => {
        const Typed = window.Typed;
        if (Typed && !window.typedInstance) {
          // Split your header into static and dynamic parts
          const staticText = "Welcome to ";
          document.getElementById('loginheader').innerHTML = 
            `${staticText}<span id="scope"></span>`;
          
          window.typedInstance = new Typed('#scope', {
            strings: ['Scope', 'The future', 'Ease'],
            typeSpeed: 100,
            backSpeed: 50,
            loop: true,
            showCursor: true,
            cursorChar: '|',
            smartBackspace: true,
            startDelay: 300,
            backDelay: 1500
          });
        }
      };
    
      document.body.appendChild(script);
    
      return () => {
        if (window.typedInstance) {
          window.typedInstance.destroy();
          delete window.typedInstance;
        }
        document.body.removeChild(script);
      };
    }, []);
    


    return <>
      <div className="containerlogin">
       <img src={logo} alt="" id="circle1" className='circle' />
       <img src={logo} alt="" id="circle2" className='circle'/>
       <span className="logologin">Scope</span>

      <div className="content">
        <h1 id='loginheader'>Welcome to <span id='scope'></span></h1>
        <p id='logindescription'>SCOPE allows professors to securely swap class slots with mutual approval, ensuring transparency, minimizing conflicts, and providing real-time updates.</p>
        <div className="bottom">
          {/* Mode-dependent UI starts here */}
          {mode === 'login' && (
            <div className="bottom">
              <div className='left'>
                {/* Wrap inputs and button in a form */}
                <form className='left'onSubmit={handleSubmit}>
                  <input type="text" name="email" placeholder="Scope email" value={formData.email} onChange={handleChange} className='textfield' required />
                  <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className='textfield' required />
                  <a href="" id='forgot'>Forgot Password ?</a>
                  {/* Display error/message if any */}
                  {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
                  {message && <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>{message}</p>}
                  <button type="submit" disabled={isLoading} id='login'>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
              </div>

              <h1 id='devider'>/</h1>

              <div className="right">
                <button id='google'>Continue with Google</button>
                <button id='contact'>Contact Us</button>
                <button id='website'>Visit our website</button>
              </div>
            </div>
          )}

          {/* Force Change Password Mode UI */} 
          {mode === 'forceChangePassword' && (
            <div className="bottom">
              <div className="left">
                <form className="left" onSubmit={handleChangePasswordSubmit}>
                  <p id="resetheader" >
                    Set a new password for your account
                  </p>
                  
                  {/* New Password Field - styled like regular textfields */}
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      placeholder="New Password"
                      className='textfield'
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.8em'
                      }}
                    >
                      {showNewPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  
                  {/* Confirm New Password Field */}
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      placeholder="Confirm New Password"
                      className='textfield'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.8em'
                      }}
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  
                  {/* Password requirements hint */}
                  <p style={{ color: '#aaa', fontFamily: 'lato, sans-serif', fontSize: '0.8em', margin: '0' }}>
                    Password must be at least 8 characters long
                  </p>

                  {/* Error and message display */}
                  {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
                  {message && <p id="message">{message}</p>}
                  
                  {/* Submit button - same style as login button */}
                  <button type="submit" id='login' disabled={isLoading}> 
                    {isLoading ? 'Saving...' : 'Set New Password'}
                  </button>
                </form>
              </div>
              
              <h1 id='devider'>/</h1>
              
              <div className="rightreset">
                <div>
                  <h3 style={{ marginBottom: '15px', color: '#00FFCC' }}>Why Change Your Password?</h3>
                  <p style={{ fontSize: '0.9em', lineHeight: '1.5' }}>
                    For security reasons, you need to set a new password on your first login. 
                    Choose a strong password that you haven't used on other sites.
                  </p>
                  <p style={{ fontSize: '0.9em', marginTop: '15px', lineHeight: '1.5' }}>
                    If you need any assistance, please contact the system administrator.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <a href="" id='resetpass'>Reset Password</a>
      </div>

      <span className="rights">© 2025 Scope. All Rights Reserved.</span>
      </div>




      </>
}

export default Login