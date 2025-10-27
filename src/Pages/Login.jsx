import React, { useState } from 'react';
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
        try {
            const res = await fetch("http://localhost:4000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) {
            alert(data.message || "Login failed");
            } else {
            alert("Login successful!");
            console.log(data.user);
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Something went wrong!");
        }
    };


  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className='inputbox'>
          <label className='emailBox'>
            <input
              style={{ padding: '7px', borderRadius: '8px' }}
              className='emailInput'
              type="email"
              placeholder='Email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>
          <label className='passwordBox'>
            <input
              style={{ padding: '7px', borderRadius: '8px' }}
              type="password"
              placeholder='Password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>
          <div className='forgotPassword'>
            <a href='/forgot-password' className='fPassword'>Forgot Password?</a>
          </div>
        </div>
        <button type="submit" className='sButton'>Login</button>
      </form>
    </div>
  );
};

export default Login;
