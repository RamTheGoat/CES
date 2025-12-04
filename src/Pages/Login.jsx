import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);


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
        setDialogMessage(data.message || "Login failed");
        setShowDialog(true);

        return;
        }

        // Save token + user info
        if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        }

        setDialogMessage(data.message || "Login successful");
        setShowDialog(true);
        console.log("User data:", data.user);

        // ✅ If using a temporary password, redirect straight to profile
        if (data.mustChangePassword === true || data.mustChangePassword === "true") {
        console.log("Redirecting to profile due to temp password");
        navigate(`/profile?userId=${data.user._id}`);
        return;
        }


        // ✅ Normal role-based navigation
        if (data.user.role === "admin") {
        navigate("/");
        return;
        }

        if (data.user.role === "user") {
        navigate("/");
        return;
        }

        setDialogMessage("Unkown user role");
        setShowDialog(true);
    } catch (err) {
        console.error("Login error:", err);
        setDialogMessage("Something went wrong!");
        setShowDialog(true);
    }
    };



  return (
    <div className="login-container">
      <h2>Login</h2>
      {showDialog && (
      <dialog open className="popup-dialog">
         <p>{dialogMessage}</p>

       <button
         onClick={() => setShowDialog(false)}
         className="close-btn"
         > 
       OK
      </button>
      </dialog>
      )}
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
          <div className='rememberMe'>
            <input
              type="checkbox"
              name='rememberMe'
              value={rememberMe}
              onChange={() => setRememberMe(prev => !prev)}
            />
            <span>Remember Me</span>
          </div>
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
