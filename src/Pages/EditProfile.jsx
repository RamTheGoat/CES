import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import "./EditProfile.css";

// Edit user data item
const EditItem = ({ userData, title, profileStates }) => {
  const {userProfile, setUserProfile, canEdit} = profileStates;
  const updateValue = e => setUserProfile(prev => ({ ...prev, [userData]: e.target.value }));
  const value = userProfile?.[userData] ?? "";

  return (
    <div className="edit-item">
      <h2 className="edit-item-title">{title}</h2>
      {canEdit ? (
        <input
          className="edit-item-input"
          type="text"
          name={userData}
          placeholder={title}
          value={value}
          onChange={updateValue}
        />
      ) : (
        <h3 className="edit-item-value">{value}</h3>
      )}
    </div>
  )
}

export default function EditProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const states = {userProfile, setUserProfile, canEdit, setCanEdit};

  // Fetch user profile
  useEffect(() =>  {
    const fetchProfile = async () => {
      if (canEdit) return;
      try {
        setUserProfile(null);
        const response = await fetch(`http://localhost:4000/api/users/${id}`);
        const profile = await response.json();
        setUserProfile(profile);
      } catch (err) {
        console.error("User profile not found:", err);
      }
    };
    fetchProfile();
  }, [id, canEdit]);

  // Handle button press
  async function handleEditButton() {
    if (canEdit) try {

      // Try update user profile
      const res = await fetch(`http://localhost:4000/api/users/edit/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile)
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      else console.log(data.message);
    } catch (err) {
      console.log("Failed to edit profile:", err);
    }

    setCanEdit(!canEdit);
  }

  function handleCloseButton() {
    if (canEdit) setCanEdit(false);
    else navigate("/");
  }

  return (
    <div className="profile-page">
      <h1>User Profile ig</h1>
      <EditItem userData="firstName" title="First Name" profileStates={states}/>
      <EditItem userData="lastName" title="Last Name" profileStates={states}/>

      {/* The user isnt allowed to change their email */}
      <div className="edit-item">
        <h2 className="edit-item-title">Email</h2>
        <h3 className="edit-item-value">{userProfile?.email ?? ""}</h3>
      </div>

      <EditItem userData="passwordHash" title="Password" profileStates={states}/>
      <EditItem userData="address" title="Billing Address" profileStates={states}/>
      <button className="edit-button" onClick={handleEditButton}>{canEdit ? "Save Profile" : "Edit Profile"}</button>
      <button className="edit-button" onClick={handleCloseButton}>{canEdit ? "Cancel" : "Close"}</button>
    </div>
  )
}