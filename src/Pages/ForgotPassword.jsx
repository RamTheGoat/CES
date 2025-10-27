import React, { useState } from 'react';
import "./ForgotPassword.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:4000/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Failed to send reset email");
            } else {
                setIsSubmitted(true);
                alert("Password reset email sent!");
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Something went wrong!");
        }
    };

    return (
        <div className="forgot_password_page">
            <div className="forgot_password_container">
                <h2>Reset Your Password</h2>
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit}>
                        <div className='inputbox'>
                            <p className='instruction_text'>
                                Enter your email address and we'll send you a link to reset your password. c:
                            </p>
                            <label className='email_box'>
                                <input
                                    style={{ padding: '7px', borderRadius: '8px' }}
                                    type="email"
                                    placeholder='Enter your email'
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </label>
                        </div>
                        <button type="submit" className='s_button'>Send Reset Link</button>
                    </form>
                ) : (
                    <div className='success_message'>
                        <p>✓ Check your email for a password reset link.</p>
                    </div>
                )}
                <div className='back_to_login'>
                    <a href='/login' className='back_link'>← Back to Login</a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;