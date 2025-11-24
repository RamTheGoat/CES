import { useEffect, useState } from "react";
import "./ManageUsers.css";

const UserItem = ({ user, onChangeRole, onChangeActive }) => {
  return (
    <div className="user-item">
      <h3 style={{margin: 0}}>{user.name} • {user.verified ? user.email : "(Unverified email)"}</h3>
      <div>
        <button
          className="action-button"
          onClick={() => onChangeRole(user.id, user.role === "admin")}
        >
          {user.role === "admin" ? "Make User" : "Make Admin"}
        </button>
        <button
          className={user.isActive ? "deactivate-button" : "activate-button"}
          onClick={() => onChangeActive(user.id, user.isActive)}
        >
          {user.isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}

export default function ManageUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/users");
        const usersData = await res.json();
        setUsers(usersData.map(user => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          isActive: user.isActive,
          role: user.role,
          verified: user.verificationToken == null,
        })));
      } catch (error) {
        console.error("Failed to fetch users:", error.message);
      }
    };
    fetchUsers();
  }, []);

  const handleChangeRole = async (userId, isAdmin) => {
    if (!window.confirm(isAdmin ?
      "Are you sure you want to revoke this user's administrative privileges?" :
      "Are you sure you want to grant this user administrative privileges?\nThey will be able to add / delete movies and manage other users, make sure you trust this user!"
    )) return;

    try {
      const res = await fetch(`http://localhost:4000/api/users/edit/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: isAdmin ? "user" : "admin",
          dontSendProfileUpdateEmail: true
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      else console.log(data.message);

      setUsers(prev => prev.map(user => (
        user.id === userId ? ({ ...user, role: isAdmin ? "user" : "admin" }) : user
      )));
    } catch (err) {
      console.log('Failed to change role:', err);
    }
  }

  const handleChangeActive = async (userId, isActive) => {
    if (!window.confirm(isActive ?
      "Are you sure you want to deactivate this user's account?\nThey will no longer be able to book tickets or edit their account!" :
      "Are you sure you want to reactivate this user's account?"
    )) return;

    try {
      const res = await fetch(`http://localhost:4000/api/users/edit/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !isActive,
          dontSendProfileUpdateEmail: true
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      else console.log(data.message);

      setUsers(prev => prev.map(user => (
        user.id === userId ? ({ ...user, isActive: !isActive }) : user
      )));
    } catch (err) {
      console.log('Failed to change active:', err);
    }
  }

  return (
    <main className="manage-users">
      <h2>Manage Admins</h2>
      <div className="user-list">
        {users.filter(user => user.role === "admin").map(user => (
          <UserItem
            key={user.id}
            user={user}
            onChangeRole={handleChangeRole}
            onChangeActive={handleChangeActive}
          />
        ))}
      </div>
      <h2>Manage Users</h2>
      <div className="user-list">
        {users.filter(user => user.role === "user").map(user => (
          <UserItem
            key={user.id}
            user={user}
            onChangeRole={handleChangeRole}
            onChangeActive={handleChangeActive}
          />
        ))}
      </div>
    </main>
  );
}