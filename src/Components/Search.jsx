import React from 'react';
import './Search.css';
import {movies} from './movies.js';

// Search bar search function
function Search() {
    const [query, setQuery] = React.useState("");

    // For debugging purposes
    console.log(movies.filter(movie => movie.title.toLowerCase().includes(query.toLowerCase())));
    return (   
        <div className="search-bar">
            {/* Search Input Field */}
            <input 
                type="text" 
                placeholder="Search..." 
                className='search' 
                onChange={e => setQuery(e.target.value)}
            />
            <ul className='list'>
                {/*filter through movies and display results that match the query */}
                {movies.filter((movie) =>
                    movie.title.toLowerCase().includes(query.toLowerCase())
                ).map((movies) => (
                    <li key={movies.id} className='list-item'>{movies.title}</li>
                ))}
            </ul>
        </div>
    );
}

export default Search; 