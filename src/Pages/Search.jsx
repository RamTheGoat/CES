import React from 'react';
import { useState, useEffect } from 'react';
import './Search.css';
import { Link } from 'react-router-dom';
// import { movies } from '../Components/movies.js';

function Search() {
  const [query, setQuery] = React.useState("");
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);

  // Fetch the movies from the backend when component loads
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/movies");
        const data = await res.json();
        setMovies(data);
        setFilteredMovies(data);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    const results = movies.filter((movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMovies(results);
  }, [query, movies]);
/*
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(query.toLowerCase())
  );
*/

  return (   
    <div className="search-bar">
      <input 
        type="text" 
        placeholder="Search..." 
        className="search" 
        onChange={e => setQuery(e.target.value)}
      />

      <div className="cards-container">
        {filteredMovies.map((movie) => (
          <Link key={movie._id} to={`/details/${movie._id}`} className="movie-card">
            {/* Show poster if available */}
            {movie.posterUrl && (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="movie-image"
              />
            )}
            <h3 className="movie-title">{movie.title}</h3>

            {/* Optional: genre */}
            {movie.genre && movie.genre.length > 0 && (
              <p className="movie-genre">{movie.genre.join(" / ")}</p>
            )}
          </Link>
        ))}
        {filteredMovies.length === 0 && (
          <p className="no-results">No movies found.</p>
        )}
      </div>
    </div>
  );
}

export default Search;
