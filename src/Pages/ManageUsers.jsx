import { useEffect, useState } from "react";
import "./ManageUsers.css";

const UserItem = ({ user, onChangeRole, onChangeActive, admin }) => {
  return (
    <div className="user-item">
      <h3 style={{margin: 0}}>{user.name} • {user.email}</h3>
      <div>
        <button
          className="action-button"
          onClick={() => onChangeRole(user.id, admin != null)}
        >
          {admin ? "Make User" : "Make Admin"}
        </button>
        <button
          className={user.isActive ? "deactivate-button" : "activate-button"}
          onClick={() => onChangeActive(user.id, admin != null)}
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
        })));
      } catch (error) {
        console.error("Failed to fetch users:", error.message);
      }
    };
    fetchUsers();
  }, []);

  const handleChangeRole = async (userId, isAdmin) => {
    window.confirm("Are you sure?");
  }

  const handleChangeActive = async (userId, isAdmin) => {
    window.confirm("Are you sure?");
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
            admin
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