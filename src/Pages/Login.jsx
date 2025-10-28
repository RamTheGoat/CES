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
        }

        // Save token + user info
        if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        }

        alert(data.message || "Login successful!");
        console.log("User data:", data.user);

        // ✅ If using a temporary password, redirect straight to profile
        if (data.mustChangePassword === true || data.mustChangePassword === "true") {
        console.log("Redirecting to profile due to temp password");
        navigate(`/profile?userId=${data.user._id}`);
        return;
        }


        // ✅ Normal role-based navigation
        if (data.user.role === "admin") {
        navigate("/adminHome");
        return;
        }

        if (data.user.role === "user") {
        navigate("/");
        return;
        }

        alert("Unknown role.");
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
