import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "./Register.css";

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // things that are needed to succeed
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        
        if (!formData.agreeToTerms) {
            alert("Please agree to the terms and conditions");
            return;
        }
        
        // registration logic
        alert(`Registration submitted!\nName: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nPhone: ${formData.phone}`);
    };

    return (
        <div className="register-page">
            <div className="register_container">
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    {/* name row */}
                    <div className='form_row'>
                        <div className='input_box'>
                            <input
                                type="text"
                                name="firstName"
                                placeholder='First Name'
                                value={formData.firstName}
                                onChange={handleChange}
                                required                        
                            />
                        </div>
                        <div className='input_box'>
                            <input
                                type="text"
                                name="lastName"
                                placeholder='Last Name'
                                value={formData.lastName}
                                onChange={handleChange}
                                required                        
                            />
                        </div>
                    </div>

                    {/* contact info */}
                    <div className='input_box'>
                        <input
                            type="email"
                            name="email"
                            placeholder='Email Address'
                            value={formData.email}
                            onChange={handleChange}
                            required                        
                        />
                    </div>
                    
                    <div className='input_box'>
                        <input
                            type="tel"
                            name="phone"
                            placeholder='Phone Number'
                            value={formData.phone}
                            onChange={handleChange}
                            required                        
                        />
                    </div>

                    {/* password check */}
                    <div className='input_box'>
                        <input
                            type="password"
                            name="password"
                            placeholder='Password'
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className='input_box'>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder='Confirm Password'
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* tos */}
                    <div className='terms_check'>
                        <input
                            type="checkbox"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            required
                        />
                        <label>
                            I agree to the <a href="/terms">Terms and Conditions</a> and <a href="/privacy">Privacy Policy</a>
                        </label>
                    </div>

                    <button type="submit" className='s_button'>Create Account</button>
                </form>

                <div className='login_link'>
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;