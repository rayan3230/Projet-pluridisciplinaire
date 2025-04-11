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