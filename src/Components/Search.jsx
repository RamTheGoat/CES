import React from 'react';
import './Search.css';
import { movies } from './movies.js';

export default function Search() {
  const [inputValue, setInputValue] = React.useState("");
  const [query, setQuery] = React.useState("");

  const handleSearch = () => {
    setQuery(inputValue.trim());
  };

  const filteredMovies = movies.filter(m =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="search-bar">
      {/* Include Material Symbols once in your app root or here */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
      />

      <div className="search-controls">
        <input
          type="text"
          placeholder="Search..."
          className="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        {/* Make sure className is used, and type="button" */}
        <button
          type="button"
          className="search-button"
          onClick={handleSearch}
          aria-label="Search"
          title="Search"
        >
          <span className="material-symbols-outlined">search</span>
        </button>
      </div>

      <div className="cards-container">
        {filteredMovies.map(movie => (
          <div key={movie.id} className="movie-card">
            {movie.image && <img src={movie.image} alt={movie.title} className="movie-image" />}
            <h3 className="movie-title">{movie.title}</h3>
            {movie.year && <p className="movie-year">{movie.year}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
