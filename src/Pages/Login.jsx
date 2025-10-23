import React, { useState } from 'react';
import "./Login.css";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here
        alert(`Email: ${email}\nPassword: ${password}`);
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className='inputbox'>
                    <label className='emailBox'>
                        <input style={{padding: '7px', borderRadius: '8px'}}
                            className='emailInput'
                            type="email"
                            placeholder='Email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required                        
                        />
                    </label>
                    <label className='passwordBox'>
                        <input style={{padding: '7px', borderRadius: '8px'}}
                            type="password"
                            placeholder='Password'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </label>
                    <div className='forgotPassword'>
                    {/* Have to implement a forgot password page */}
                    <a href='/forgot-password' className='fPassword'>Forgot Password?</a> 
                </div>
                </div>
                <button type="submit" className='sButton'>Login</button>
            </form>
        </div>
    );
};

export default Login;