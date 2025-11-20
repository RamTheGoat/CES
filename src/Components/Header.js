import { NavLink, useNavigate } from "react-router-dom";
import "./Header.css";


export default function Header() {
  //const isLoggedIn = false; // Replace with actual authentication logic
  const navigate = useNavigate();

  // Check login state
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!token && !!storedUser;

  // Handle logout and clear session
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login"); // Redirect to login after logout
    
    //window.location.href = "/login";
  }

  return (
    <div className="nav-shell">
      <header className="nav-inner">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />        
        <nav>
          <NavLink to={"/"} end>Home</NavLink>
          <NavLink to="/browse">Browse</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/faq">FAQ</NavLink>
          {/* Search button */}
          <NavLink to="/search" className="search-button" aria-label="Search" title="Search">
            <span className="material-symbols-outlined">search</span>
          </NavLink>
          {/* Notification button */}
          <button type="button" className="notifications-button">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          {/* User profile button */}
          {/* make it link to profile if logged in, else to login page */}
          <NavLink to={isLoggedIn ? "/profile" : "/login"} className="profile-button" aria-label="Profile" title={isLoggedIn ? "Profile" : "Login"}>
            <span className="material-symbols-outlined">account_circle</span>
          </NavLink>

          {/* logout button, only show when logged in} */}
          {isLoggedIn && 
          (
            <button
              type = "button"
              className = "logout-button"
            
          onClick = {handleLogout}
            aria-label="Logout"
            title="Logout"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        )}
        </nav>
      </header>
    </div>
  );
}
