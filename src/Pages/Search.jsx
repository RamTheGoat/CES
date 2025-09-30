import React from 'react';
import './Search.css';
import { movies } from '../Components/movies.js';

function Search() {
  const [query, setQuery] = React.useState("");

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(query.toLowerCase())
  );

  return (   
    <div className="search-bar">
      <input 
        type="text" 
        placeholder="Search..." 
        className="search" 
        onChange={e => setQuery(e.target.value)}
      />

      <div className="cards-container">
        {filteredMovies.map(movie => (
          <div key={movie.id} className="movie-card">
            {/* Add an image if your movie object has one */}
            {movie.image && <img src={movie.image} alt={movie.title} className="movie-image" />}
            <h3 className="movie-title">{movie.title}</h3>
            {/* You can show more fields if available, e.g. year or genre */}
            {movie.year && <p className="movie-year">{movie.year}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;
