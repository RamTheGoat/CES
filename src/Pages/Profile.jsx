import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import "./Profile.css";

// Edit user data item
const EditItem = ({ userData, title, profile, setProfile, edit }) => {
  const updateValue = e => setProfile(prev => ({ ...prev, [userData]: e.target.value }));
  const value = profile?.[userData] ?? "";

  return (
    <div className="edit-item">
      <h2 className="edit-item-title">{title}</h2>
      {edit ? (
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

export default function Profile() {
  const { id } = useParams();

  const [userProfile, setUserProfile] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  // Fetch user profile
  useEffect(() =>  {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/users/${id}`);
        const profile = await response.json();
        setUserProfile(profile);
      } catch (err) {
        console.error("User profile not found:", err);
      }
    };
    fetchProfile();
  }, [id]);

  // Handle button press
  async function handleButton() {
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

  return (
    <div className="profile-page">
      <h1>User Profile ig</h1>
      <EditItem userData="firstName" title="First Name" profile={userProfile} setProfile={setUserProfile} edit={canEdit}/>
      <EditItem userData="lastName" title="Last Name" profile={userProfile} setProfile={setUserProfile} edit={canEdit}/>

      {/* The user isnt allowed to change their email */}
      <div className="edit-item">
        <h2 className="edit-item-title">Email</h2>
        <h3 className="edit-item-value">{userProfile?.email ?? ""}</h3>
      </div>

      <EditItem userData="passwordHash" title="Password" profile={userProfile} setProfile={setUserProfile} edit={canEdit}/>
      <EditItem userData="address" title="Billing Address" profile={userProfile} setProfile={setUserProfile} edit={canEdit}/>
      <button className="edit-button" onClick={handleButton}>{canEdit ? "Save Profile" : "Edit Profile"}</button>
    </div>
  )
}