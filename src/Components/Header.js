import { NavLink } from "react-router-dom";
import "./Header.css";

/* Search button functionality - to be implemented later */
//const searchButton = document.querySelector('.search-button');

//searchButton.addEventListener('click', function() {
  // Add your JavaScript logic here, e.g.,
  // openSearchOverlay();
  // submitSearchForm();
//}); 

export default function Header() {
  return (
    <div className="nav-shell">
      <header className="nav-inner">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />        
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/browse">Browse</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/faq">FAQ</NavLink>
          {/* Search button */}
          <button type="submit" class="search-button">
            <span class="material-symbols-outlined">search</span>
          </button>
          {/* Notification button */}
          <button type="button" class="notifications-button">
            <span class="material-symbols-outlined">notifications</span>
          </button>
          {/* User profile button */
          <button type="button" class="profile-button">
            <span class="material-symbols-outlined">account_circle</span>
          </button>}
          {/* light mode toggle button */
          <button type="button" class="light-mode-button">
            <span class="material-symbols-outlined">light_mode</span>
          </button>}
        </nav>
      </header>
    </div>
  );
}
