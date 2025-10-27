import React, { useState, useEffect } from 'react';
import "./Profile.css";

const Profile = () => {
    // This will eventually use data from the login, for now use test user id
    const userId = "68fd5bd183469bb90d227ac0";

    const [userData, setUserData] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    // Fetch user profile
    const fetchProfile = async () => {
        console.log("fetch");
        try {
            setUserData({});
            const response = await fetch(`http://localhost:4000/api/users/${userId}`);
            const profile = await response.json();
            setUserData(profile);
        } catch (err) {
            console.error("User profile not found:", err);
        }
    };
    useEffect(() => {
        fetchProfile();
    }, []);

    // Update user profile
    const updateUserProfile = async (userData, error) => {
        console.log("update");
        try {
            const res = await fetch(`http://localhost:4000/api/users/edit/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            else console.log(data.message);
        } catch (err) {
            console.log('Failed to edit profile:', err);
            error(err);
        }
    }

    // toggle for edit mode
    const handleEditToggle = () => {
        if (isEditing) {
            setUserData(userData);
            updateUserProfile({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phone: userData.phone,
                address: userData.address,
                promotion: userData.promotion
            }, fetchProfile);
        }
        setIsEditing(!isEditing);
    };

    // handling changes in edit mode
    const handleInputChange = (field, value) => {
        if (field === 'phone') {
            value = value.replace(/^(\d{3})(\d{3})(\d{4})$/, "($1)-$2-$3");
            value = value.slice(0, 14);
        }
        setUserData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // promo toggle
    const handlePromoToggle = () => {
        setUserData(prev => ({
            ...prev,
            promotion: !prev.promotion
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
                                    value={userData.firstName ?? ""}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    placeholder="First Name"
                                />
                                <input
                                    className="input_field"
                                    type="text"
                                    value={userData.lastName ?? ""}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    placeholder="Last Name"
                                />
                                <input
                                    className="input_field"
                                    type="email"
                                    value={userData.email ?? ""}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="Email Address"
                                />
                                <input
                                    className="input_field"
                                    type="tel"
                                    value={userData.phone ?? ""}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="Phone Number"
                                />
                                <input
                                    className="input_field"
                                    type="text"
                                    value={userData.address ?? ""}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    placeholder="Billing Address"
                                />
                            </div>
                        ) : (
                            // displaying (NO EDIT) mode
                            <div>
                                <div className="info_row">
                                    <span className="info_label">Name</span>
                                    <span className="info_value">{userData.firstName ?? ""} {userData.lastName ?? ""}</span>
                                </div>
                                <div className="info_row">
                                    <span className="info_label">Email</span>
                                    <span className="info_value">{userData.email ?? ""}</span>
                                </div>
                                <div className="info_row">
                                    <span className="info_label">Phone</span>
                                    <span className="info_value">{userData.phone ?? ""}</span>
                                </div>
                                <div className="info_row">
                                    <span className="info_label">Billing Address</span>
                                    <span className="info_value">{userData.address ?? ""}</span>
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
                                    checked={isEditing ? userData.promotion ?? false : userData.promotion ?? false}
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
                            {userData.paymentCards ? userData.paymentCards.map(card => (
                                <div key={card._id} className="payment_item">
                                    <div>
                                        <span className="info_value">{card.cardType} •••• {card.cardNumber % 10000}</span>
                                        <span className="info_label"> Expires {card.expirationMonth}/{card.expirationYear}</span>
                                    </div>
                                    <button 
                                        className="secondary_button"
                                        onClick={() => handleEditPayment(card.id)}
                                    >
                                        Edit
                                    </button>
                                </div>
                            )) : (
                                <p>No payment methods added</p>
                            )}
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