import React, { useState, useEffect } from 'react';
import "./Profile.css";

const PaymentCard = ({ card, newCard, onEdit, onDelete }) => {
    const [cardData, setCardData] = useState(card ?? {
        cardType: "Visa",
        cardNumber: "",
        expirationMonth: 1,
        expirationYear: 2025
    });
    const [isEditing, setIsEditing] = useState(newCard);

    const getDateAsString = () => {
        if (cardData.expirationMonth == null || cardData.expirationYear == null) return `2025-01-01`;
        else if (cardData.expirationMonth > 9) return `${cardData.expirationYear}-${cardData.expirationMonth}-01`;
        else return `${cardData.expirationYear}-0${cardData.expirationMonth}-01`;
    }

    const handleEditButton = () => {
        if (isEditing) {
            if (newCard && cardData.cardNumber.length < 16) return alert("Invalid payment card number!");
            const data = {
                cardType: cardData.cardType,
                expirationMonth: cardData.expirationMonth,
                expirationYear: cardData.expirationYear
            };
            if (newCard) data.cardNumber = cardData.cardNumber;
            onEdit(cardData._id, data);
        }
        setIsEditing(!isEditing || newCard);
    }

    const handleInputChange = (field, value) => {
        if (field === 'expirationDate') {
            let date = new Date(value + 1000000000);
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

    return isEditing || newCard ? (
        <div className="payment_item" id="edit">
            <input
                className="input_field"
                type={newCard ? "number" : "text"}
                value={newCard ? cardData.cardNumber : `XXXX-XXXX-XXXX-${cardData.lastFour}`}
                onChange={e => handleInputChange('cardNumber', e.target.value)}
                placeholder="Card Number"
                readOnly={!newCard}
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
                <button
                    className={newCard ? "confirm_button" : "secondary_button"}
                    onClick={handleEditButton}
                >{newCard ? "Confirm" : "Save"}</button>
                <button
                    className={newCard ? "secondary_button" : "delete_button"}
                    onClick={() => { onDelete(cardData._id) }}
                    id="delete_payment"
                >{newCard ? "Cancel" : "Delete"}</button>
            </div>
        </div>
    ) : (
        <div className="payment_item">
            <div>
                <span className="info_value">{cardData.cardType} •••• {cardData.lastFour}</span>
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
    const [addPaymentCard, setAddPaymentCard] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [passwordInput, setPasswordInput] = useState({});

    const isLoggedIn = true;
    const handleLogout = () => {
        window.location.href = "/login";
    };

    // Fetch user profile
    const fetchProfile = async () => {
        try {
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
            await fetchProfile();
        }
        setIsEditing(!isEditing);
    };

    // handling changes in edit mode
    const handleInputChange = (field, value) => {
        setUserData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordInputChange = (field, value) => {
        setPasswordInput(prev => ({
            ...prev,
            [field]: value
        }));
    }

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
            await fetchProfile();
        }
    };

    // add payment method
    const handleAddPayment = async (cardId, cardData) => {
        if (!cardData.cardType || !cardData.cardNumber || !cardData.expirationMonth || !cardData.expirationYear) return;

        try {
            const res = await fetch(`http://localhost:4000/api/users/card/add/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cardData)
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            else console.log(data.message);
            await fetchProfile();
        } catch (err) {
            console.log('Failed to add payment card:', err);
        }
        setAddPaymentCard(false);
    };

    // delete payment method
    const handleDeletePayment = async cardId => {
        if (!window.confirm("Are you sure you want to delete this payment card?")) return;

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
                paymentCards: prev.paymentCards.filter(card => card._id !== cardId)
            }));
        } catch (err) {
            console.log('Failed to delete payment card:', err);
            await fetchProfile();
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

                {/* logout button show */}
                {isLoggedIn && (
                    <button className="logout_button"
                    onClick={handleLogout}>
                        Log Out
                    </button>
                )}
                
                {/* edit/save button */}
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
                                    className={changePassword ? "confirm_button" : "secondary_button"}
                                    onClick={changePassword ? handleChangePassword : () => { setChangePassword(true) }}
                                >{changePassword ? "Save Password" : "Change Password"}</button>
                                <button 
                                    id="delete_payment"
                                    className={changePassword ? "delete_button" : "secondary_button"}
                                    onClick={changePassword ? () => { setChangePassword(false); setPasswordInput({}) } : handleResetPassword}
                                >{changePassword ? "Cancel" : "Reset Password"}</button>
                            </div>
                        </div>
                        {changePassword ? <div>
                            <input
                                className="input_field"
                                type="text"
                                value={passwordInput.current ?? ""}
                                onChange={(e) => handlePasswordInputChange('current', e.target.value)}
                                placeholder="Current Password"
                            />
                            <input
                                className="input_field"
                                type="text"
                                value={passwordInput.new ?? ""}
                                onChange={(e) => handlePasswordInputChange('new', e.target.value)}
                                placeholder="New Password"
                            />
                        </div> : <></>}
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
                                onClick={() => { setAddPaymentCard(userData.paymentCards && userData.paymentCards.length < 4) }}
                            >
                                Add New
                            </button>
                        </div>
                        <div className="payment_methods">
                            {addPaymentCard ? (
                                <div key="new">
                                    <PaymentCard newCard onEdit={handleAddPayment} onDelete={() => { setAddPaymentCard(false) }}/>
                                </div>
                            ) : <></> }
                            {userData.paymentCards && userData.paymentCards.length > 0 ? userData.paymentCards.map(card => (
                                <div key={card._id}>
                                    <PaymentCard card={card} onEdit={handleEditPayment} onDelete={handleDeletePayment}/>
                                </div>
                            )) : !addPaymentCard ? (
                                <p>No payment methods added</p>
                            ) : <></>}
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