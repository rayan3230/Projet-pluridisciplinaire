import './Login.css'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import logo from '../../assets/circle.png';
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
        <div className="left">
          <input type="text" name="email" placeholder="University or personal email" value={formData.email} onChange={handleChange} className='textfield'  />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className='textfield' />
          <a href="" id='forgot'>Forgot Password ?</a>
          <button onClick={handleSubmit} disabled={isLoading} id='login'>
        {isLoading ? 'Logging in...' : 'Login'}
        </button>       
         </div>

        <h1 id='devider'>/</h1>

        <div className="right">
          <button id='google'>Continue with Google</button>
          <button id='contact'>Contact Us</button>
          <button id='website'>Visit our website</button>
        </div>

        


        </div>
        <a href="" id='resetpass'>Reset Password</a>
      </div>

      <span className="rights">© 2025 Scope. All Rights Reserved.</span>
      </div>




      </>
}

export default Login