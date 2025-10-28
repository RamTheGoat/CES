import React, { useState } from 'react';
import "./ChangePassword.css";

const ChangePassword = ({ userId }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const res = await fetch("http://localhost:4000/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ userId, newPassword })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to change password");
            } else {
                setIsSubmitted(true);
                alert("Password changed successfully!");
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Something went wrong!");
        }
    };

    return (
        <div className="change_password_page">
            <div className="change_password_container">
                <h2>Change Your Password</h2>
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit}>
                        <div className='inputbox'>
                            <label>
                                <input
                                    type="password"
                                    placeholder='Enter new password'
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                <input
                                    type="password"
                                    placeholder='Confirm new password'
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </label>
                        </div>
                        <button type="submit" className='s_button'>Change Password</button>
                    </form>
                ) : (
                    <div className='success_message'>
                        <p>✓ Your password has been changed successfully.</p>
                        <p>You can now log in with your new password.</p>
                    </div>
                )}
                <div className='back_to_login'>
                    <a href='/login' className='back_link'>← Back to Login</a>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
