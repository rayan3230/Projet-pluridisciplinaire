import './Login.css'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import logo from '../../assets/Group 1.png';
import topright from '../../assets/topright.png';
import bottomleft from '../../assets/bottomleft.png';
import bottomright from '../../assets/bottomright.png';
import google from '../../assets/google.png';
//import bottomright2 from './assets/Vector 2.png';

const Login = ({ onUserAdded }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
      event.preventDefault();
      setIsLoading(true);
      setMessage('');
      
      try {
          console.log('Attempting login with:', formData);
          const response = await axios.post('http://127.0.0.1:8000/api/login/', formData, {
              headers: {
                  'Content-Type': 'application/json',
              }
          });
          
          console.log('Login response:', response.data);
          
          if (response.data.message === 'Login successful') {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setMessage('Login successful!');
            if (typeof onUserAdded === 'function') {
                onUserAdded(response.data.user);
            }
            navigate('/home');
          }
      } catch (error) {
          console.error('Login error details:', {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status
          });
          setMessage(error.response?.data?.message || 'Failed to sign in. Please check your credentials.');
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
          
          <button type="submit" id='google'>
            <img src={google} alt="google logo" />
            <span>Continue with google</span>
          </button>

        <form onSubmit={handleSubmit}>
          <input 
          type="email"
          name='email'
          placeholder="Enter Email..." 
          value={formData.email}
          onChange={handleChange}
          required
          />
            <div id='password'>   
            <input 
            type="password" 
            name='password'
            placeholder="Enter Password..."
            value={formData.password}
            onChange={handleChange}
            required
            />
            <p>
              <a href="#" className="textbut">Forgot Password?</a>
            </p>
            </div>
            
            {message && <p className={message.includes('successful') ? 'success-message' : 'error-message'}>{message}</p>}
            
            <button type="submit" id='submit' disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <p >
            Can't sign in? Try <a href="#" className="textbut">resetting your password</a> or <a href="#" className="textbut">contact us</a> for assistance.
            </p>
        </form>


        </div>
      </div>
      </>
}


export default Login