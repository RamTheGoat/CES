import React, { useState, useEffect } from 'react';
import "./Profile.css";

const PaymentCard = ({ card, onEdit, onDelete }) => {
    const [cardData, setCardData] = useState(card);
    const [isEditing, setIsEditing] = useState(false);

    const getDateAsString = () => {
        if (cardData.expirationMonth == null || cardData.expirationYear == null) return `2025-01-01`;
        else if (cardData.expirationMonth > 9) return `${cardData.expirationYear}-${cardData.expirationMonth}-01`;
        else return `${cardData.expirationYear}-0${cardData.expirationMonth}-01`;
    }

    const handleEditButton = () => {
        if (isEditing) onEdit(cardData._id, {
            cardType: cardData.cardType,
            lastFour: cardData.lastFour,
            expirationMonth: cardData.expirationMonth,
            expirationYear: cardData.expirationYear
        });
        setIsEditing(!isEditing);
    }

    const handleInputChange = (field, value) => {
        if (field === 'expirationDate') {
            let date = new Date(value + 14400000);
            setCardData(prev => ({
                ...prev,
                expirationMonth: date.getMonth() + 1,
                expirationYear: date.getFullYear()
            }));
        } else {
            setCardData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    }

    return isEditing ? (
        <div className="payment_item" id="edit">
            <input
                className="input_field"
                type="number"
                value={cardData.lastFour ?? ""}
                onChange={e => handleInputChange('lastFour', e.target.value)}
                placeholder="Card Number"
            />
            <div className="payment_row">
                <select
                    className="select_field"
                    value={cardData.cardType}
                    onChange={e => handleInputChange('cardType', e.target.value)}
                >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="American Express">American Express</option>
                    <option value="Discover">Discover</option>
                </select>
                <input
                    className="input_field"
                    type="date"
                    value={getDateAsString()}
                    onChange={e => handleInputChange('expirationDate', e.target.valueAsNumber)}
                    placeholder="Expiration Date"
                    onKeyDown={e => e.preventDefault()}
                    min="2001-01-01"
                />
            </div>
            <div className="payment_row">
                <button className="secondary_button" onClick={handleEditButton}>Save</button>
                <button className="delete_button" onClick={() => { onDelete(cardData._id) }}>Delete</button>
            </div>
        </div>
    ) : (
        <div className="payment_item">
            <div>
                <span className="info_value">{cardData.cardType} •••• {cardData.lastFour % 10000}</span>
                <span className="info_label"> Expires {cardData.expirationMonth}/{cardData.expirationYear % 100}</span>
            </div>
            <button className="secondary_button" onClick={handleEditButton}>Edit</button>
        </div>
    );
};

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

    // toggle for edit mode
    const handleEditToggle = async () => {
        if (isEditing) try {
            const res = await fetch(`http://localhost:4000/api/users/edit/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    phone: userData.phone,
                    address: userData.address,
                    promotion: userData.promotion
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            else console.log(data.message);
        } catch (err) {
            console.log('Failed to edit profile:', err);
            fetchProfile();
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
    const handleEditPayment = async (cardId, cardData) => {
        try {
            const res = await fetch(`http://localhost:4000/api/users/card/edit/${cardId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cardData)
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            else console.log(data.message);

            setUserData(prev => {
                let index = prev.paymentCards.findIndex(card => card._id === cardId);
                prev.paymentCards[index] = {
                    ...prev.paymentCards[index],
                    ...cardData
                }
                return prev;
            });
        } catch (err) {
            console.log('Failed to edit payment card:', err);
            fetchProfile();
        }
    };

    // add payment method
    const handleAddPayment = () => {
        alert('Add new payment method');
        // more db stuff
    };

    // delete payment method
    const handleDeletePayment = async cardId => {
        let confirmDelete = window.confirm("Are you sure you want to delete this payment card?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:4000/api/users/card/remove/${cardId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            else console.log(data.message);

            setUserData(prev => ({
                ...prev,
                paymentCards: prev.paymentCards.filter(card => card._id != cardId)
            }));
        } catch (err) {
            console.log('Failed to edit payment card:', err);
        }
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
                                <div key={card._id}>
                                    <PaymentCard card={card} onEdit={handleEditPayment} onDelete={handleDeletePayment}/>
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