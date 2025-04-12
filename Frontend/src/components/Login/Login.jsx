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

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [mode, setMode] = useState('login');

    const [tempPassword, setTempPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [initialUserData, setInitialUserData] = useState(null);

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [showWelcome, setShowWelcome] = useState(true);
    const [showTempHeader, setShowTempHeader] = useState(true);

    const handleLoginSubmit = async (event) => {
      event.preventDefault();
      setIsLoading(true);
      setMessage('');
      setError('');
      setInitialUserData(null);
      
      const loginPayload = {
          scope_email: formData.email,
          password: formData.password    
      };

      try {
          console.log('Attempting login with:', loginPayload);
          const response = await apiClient.post('/users/auth/login/', loginPayload);
          
          console.log('Login response:', response.data);
          const userData = response.data.user;

          login(userData);
          
          if (userData?.needs_password_change) {
              setMessage('Login successful! Please set your new password.');
              setTempPassword(formData.password);
              setInitialUserData(userData);
              setMode('forceChangePassword');
          } else {
              setMessage('Login successful! Redirecting...');
              setTimeout(() => {
                  if (userData?.is_admin) {
                      navigate('/admin/dashboard', { replace: true });
                  } else if (userData?.is_teacher) {
                      navigate('/teacher/dashboard', { replace: true });
                  } else {
                      navigate('/', { replace: true }); 
                  }
              }, 100);
          }
          
      } catch (err) {
          console.error('Login error details:', {
              message: err.message,
              response: err.response?.data,
              status: err.response?.status
          });
          const errorDetail = err.response?.data?.detail || err.response?.data?.message || 'Failed to sign in. Please check your credentials.';
          setError(errorDetail);
          setMessage('');
      } finally {
          setIsLoading(false);
      }
    };
  
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

        if (!initialUserData) {
            setError('User data lost. Please try logging in again.');
            setMode('login');
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                scope_email: initialUserData.scope_email,
                current_password: tempPassword, 
                new_password: newPassword
            };
            await apiClient.post('/users/change-password/', payload);

            setMessage('Password changed successfully! Redirecting...');
            console.log('Password change successful');

            const updatedUser = { 
                ...initialUserData, 
                needsPasswordChange: false 
            };
            login(updatedUser); 

            setTimeout(() => {
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
      setFormData({
          ...formData,
          [e.target.name]: e.target.value
      });
    };

    const handleSubmit = (event) => {
        handleLoginSubmit(event);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowTempHeader(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Temporarily comment out Typed.js effect
    useEffect(() => {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/typed.js@2.1.0/dist/typed.umd.js";
      script.async = true;
      
      script.onload = () => {
        const Typed = window.Typed;
        if (Typed && !window.typedInstance) {
          const staticText = "Welcome to ";
          document.getElementById('loginheader').innerHTML = 
            `${staticText}<span id="scope"></span>`;
          
          window.typedInstance = new Typed('#scope', {
            strings: ['Scope', 'The Future', 'Ease'],
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
       <div id="circle1" className='circle'></div>
       <div id="circle2" className='circle'></div>
       
       {showTempHeader && (
           <h1 className="temp-header">Student Driven <span>Solution</span></h1>
       )}

       <span className="logologin" onClick={() => { setMode('login'); setMessage(""); }}>Scope</span>
       
       <div className="content">
         <h1 id="loginheader">Welcome to <span>Scope</span></h1>
         <p id="logindescription">SCOPE allows professors to securely swap class slots with mutual approval, ensuring transparency, minimizing conflicts, and providing real-time updates.</p>
         
         <div className="bottom">
           {mode === 'login' && (
             <div className="bottom">
               <div className='left'>
                 <form className='left' onSubmit={handleSubmit}>
                   <input type="text" name="email" placeholder="Scope email" value={formData.email} onChange={handleChange} className='textfield' required />
                   <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className='textfield' required />
                   <p className="login-hint">Please use your assigned Scope email and password.</p>
                   
                   {error && <p className="error-message">{error}</p>}
                   {message && <p className="success-message">{message}</p>}
                   <button type="submit" disabled={isLoading} id='login'>
                     {isLoading ? 'Logging in...' : 'Login'}
                   </button>
                 </form>
               </div>

               <h1 id='devider'>/</h1>

               <div className="right">
                 <button id='contact'>Contact Us</button>
                 <button id='website'>Visit our website</button>
               </div>
             </div>
           )}

           {mode === 'forceChangePassword' && (
             <div className="bottom">
               <div className="left">
                 <form className="left" onSubmit={handleChangePasswordSubmit}>
                   <p id="resetheader" >
                     Set a new password for your account
                   </p>
                   
                   <div className="password-input-container">
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
                       className="password-toggle-btn"
                     >
                       {showNewPassword ? 'Hide' : 'Show'}
                     </button>
                   </div>
                   
                   <div className="password-input-container">
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
                       className="password-toggle-btn"
                     >
                       {showConfirmPassword ? 'Hide' : 'Show'}
                     </button>
                   </div>
                   
                   <p className="password-hint">
                     Password must be at least 8 characters long
                   </p>

                   {error && <p className="error-message">{error}</p>}
                   {message && <p className="success-message">{message}</p>}
                   
                   <button type="submit" id='login' disabled={isLoading}> 
                     {isLoading ? 'Saving...' : 'Set New Password'}
                   </button>
                 </form>
               </div>
               
               <h1 id='devider'>/</h1>
               
               <div className="rightreset">
                 <div>
                   <h3 className="reset-info-title">Why Change Your Password?</h3>
                   <p className="reset-info-text">
                     For security reasons, you need to set a new password on your first login. 
                     Choose a strong password that you haven't used on other sites.
                   </p>
                   <p className="reset-info-text">
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