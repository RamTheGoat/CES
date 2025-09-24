import { NavLink } from "react-router-dom";
import "./Header.css";

export default function Header() {
  return (
    <div className="nav-shell">
      <header className="nav-inner">
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/browse">Browse</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/faq">FAQ</NavLink>
        </nav>
      </header>
    </div>
  );
}
