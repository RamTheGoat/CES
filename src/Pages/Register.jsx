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
        agreeToTerms: false,
        acceptPromos: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const sendData = async() => {
        try {
            const response = await fetch("http://localhost:4000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json(); 

            if (response.ok) {
                alert("Registration successful!");
                console.log("Server response:", data)
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        }
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
        //alert(`Registration submitted!\nName: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nPhone: ${formData.phone}`);
        sendData(); 
    };

    
    return (
        <div className="register-page">
            <div className="register_container">
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    {/* name row */}
                    <div className='form_container'>
                        <div className='input_box'>
                            <label className='input_label'>
                                First Name<span className='required_star'>*</span>
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder='First Name'
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required                        
                                    />
                                </label>
                        </div>
                        <div className='input_box'>
                            <label className='input_label'>
                                Last Name<span className='required_star'>*</span>
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder='Last Name'
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required                        
                                />
                            </label>
                        </div>
                    </div>

                    {/* contact info */}
                    <div className='input_box'>
                        <label className='input_label'>
                            Email Address<span className='required_star'>*</span>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder='Email Address'
                                    value={formData.email}
                                    onChange={handleChange}
                                    required                        
                                />
                            </label>
                    </div>
                    
                    <div className='input_box'>
                        <label className='input_label'>
                            Phone Number<span className='required_star'>*</span>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder='Phone Number'
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required                        
                                />
                        </label>
                    </div>

                    {/* password check */}
                    <div className='input_box'>
                        <label className='input_label'>
                            Password<span className='required_star'>*</span>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder='Password'
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                        </label>
                    </div>
                    
                    <div className='input_box'>
                        <label className='input_label'>
                            Confirm Password<span className='required_star'>*</span>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder='Confirm Password'
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                        </label>
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
                            <span className='required_star'>*</span>
                        </label>
                    </div>

                    {/* promos */}
                    <div className='promo_check'>
                        <input
                            type="checkbox"
                            name="acceptPromos"
                            checked={formData.acceptPromos}
                            onChange={handleChange}
                        />
                        <label>
                            Yes, I want to receive promotional emails and special offers
                        </label>
                    </div>

                    <button type="submit" className='s_button'>Create Account</button>
                </form>

                {/* required field */}
                <div className='required_note'>
                    <span className='required_star'>*</span> Required field
                </div>

                <div className='login_link'>
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;