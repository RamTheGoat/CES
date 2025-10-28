import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      } else {
        alert("Login successful!");
        console.log(data.user);

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "admin") {
          navigate("/adminHome");
        } else if (data.user.role === "user") {
          navigate("/");
        } else {
          alert("Unknown role.");
        }
      }

      /*
      const user = data.user;

      // Save token + user info for later use 
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect to Change Password page if user must change password
      if (data.mustChangePassword) {
        navigate(`/changepassword?userId=${user._id}`);
        return;
      }

      // Normal login: redirect to home/dashboard
      navigate("/"); // replace with your home/dashboard route
      */

    } catch (err) {
      console.error("Login error:", err);
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
            <a href='/forgotpassword' className='fPassword'>Forgot Password?</a>
          </div>
          <div className='createAccount'>
            <a href='/register' className='cAccount'>Create an account</a>
          </div>
        </div>
        <button type="submit" className='sButton'>Login</button>
      </form>
    </div>
  );
};

export default Login;
