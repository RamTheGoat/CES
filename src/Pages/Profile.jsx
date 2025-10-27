import React, { useState } from 'react';
import "./Profile.css";

const Profile = () => {
    // not linked to the DB yet so using sample data
    const [userData, setUserData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        acceptPromos: true,
        paymentMethods: [
            { id: 1, type: 'Visa', lastFour: '4242', expiry: '12/25' },
            { id: 2, type: 'Mastercard', lastFour: '8888', expiry: '06/24' }
        ]
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...userData });

    // toggle for edit mode
    const handleEditToggle = () => {
        if (isEditing) {
            // save changes
            setUserData(editData);
        }
        setIsEditing(!isEditing);
    };

    // handling changes in edit mode
    const handleInputChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // promo toggle
    const handlePromoToggle = () => {
        setEditData(prev => ({
            ...prev,
            acceptPromos: !prev.acceptPromos
        }));
    };

    // password changing
    const handleChangePassword = () => {
        alert('dont have actual password change in yet cause gotta link it to DB for that'); // sorry, this isnt implemented yet cause its db stuff
    };

    // reset password
    const handleResetPassword = () => {
        alert('password reset email/whatnot goes here');
        // sorry again, needs db work to actually change it
    };

    // payment info edit
    const handleEditPayment = (paymentId) => {
        alert(`Edit payment method ${paymentId}`);
        // more db stuff
    };

    // add payment method
    const handleAddPayment = () => {
        alert('Add new payment method');
        // more db stuff
    };

    // delete account
    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            alert('Account deletion would be processed here');
            // again, gotta link this to db
        }
    };

    return (
        <div className="profile_page">
            <div className="profile_container">
                <h2>My Profile</h2>
                
                {/* edit/save buttom */}
                <button 
                    className="edit_button"
                    onClick={handleEditToggle}
                >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>

                <div className="profile_card">
                    {/* pers info stuff */}
                    <div className="profile_section">
                        <div className="section_header">
                            <h3>Personal Information</h3>
                        </div>
                        
                        {isEditing ? (
                            // edit mode inputs
                            <div>
                                <input
                                    className="input_field"
                                    type="text"
                                    value={editData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    placeholder="First Name"
                                />
                                <input
                                    className="input_field"
                                    type="text"
                                    value={editData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    placeholder="Last Name"
                                />
                                <input
                                    className="input_field"
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="Email Address"
                                />
                                <input
                                    className="input_field"
                                    type="tel"
                                    value={editData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="Phone Number"
                                />
                            </div>
                        ) : (
                            // displaying (NO EDIT) mode
                            <div>
                                <div className="info_row">
                                    <span className="info_label">Name</span>
                                    <span className="info_value">{userData.firstName} {userData.lastName}</span>
                                </div>
                                <div className="info_row">
                                    <span className="info_label">Email</span>
                                    <span className="info_value">{userData.email}</span>
                                </div>
                                <div className="info_row">
                                    <span className="info_label">Phone</span>
                                    <span className="info_value">{userData.phone}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* password stuff */}
                    <div className="profile_section">
                        <div className="section_header">
                            <h3>Password & Security</h3>
                        </div>
                        <div className="info_row">
                            <span className="info_label">Password</span>
                            <div>
                                <button 
                                    className="secondary_button"
                                    onClick={handleChangePassword}
                                >
                                    Change Password
                                </button>
                                <button 
                                    className="secondary_button"
                                    onClick={handleResetPassword}
                                >
                                    Reset Password
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* promo section */}
                    <div className="profile_section">
                        <div className="section_header">
                            <h3>Email Preferences</h3>
                        </div>
                        <div className="info_row">
                            <span className="info_label">Receive Promotional Emails</span>
                            <label className="toggle_switch">
                                <input 
                                    type="checkbox" 
                                    checked={isEditing ? editData.acceptPromos : userData.acceptPromos}
                                    onChange={handlePromoToggle}
                                    disabled={!isEditing}
                                />
                                <span className="toggle_slider"></span>
                            </label>
                        </div>
                    </div>

                    {/* payment section */}
                    <div className="profile_section">
                        <div className="section_header">
                            <h3>Payment Methods</h3>
                            <button 
                                className="action_button"
                                onClick={handleAddPayment}
                            >
                                Add New
                            </button>
                        </div>
                        <div className="payment_methods">
                            {userData.paymentMethods.map(payment => (
                                <div key={payment.id} className="payment_item">
                                    <div>
                                        <span className="info_value">{payment.type} •••• {payment.lastFour}</span>
                                        <span className="info_label"> Expires {payment.expiry}</span>
                                    </div>
                                    <button 
                                        className="secondary_button"
                                        onClick={() => handleEditPayment(payment.id)}
                                    >
                                        Edit
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DELETE ACCOUNT DANGER SECTION */}
                    <div className="danger_zone">
                        <div className="section_header">
                            <h3 style={{ color: '#ff4757' }}>Danger Zone</h3>
                        </div>
                        <div className="info_row">
                            <span className="info_label">Delete Account</span>
                            <button 
                                className="danger_button"
                                onClick={handleDeleteAccount}
                            >
                                Delete My Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;