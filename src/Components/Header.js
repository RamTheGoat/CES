import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <div className="nav-shell">    
      <header className="nav-inner">  
        <nav>
          <a href="/">Home</a>
          <a href="/browse">Browse</a>
          <a href="/pricing">Pricing</a>
          <a href="/FAQ">FAQ</a>
        </nav>
      </header>
    </div>
  );
}
