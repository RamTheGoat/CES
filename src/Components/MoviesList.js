import { useEffect, useState } from "react";

export default function MovieList() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5000/api/movies")
            .then((res) => res.json())
            .then((data) => {
                setMovies(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading movies...</p>;

    return (
        <div className="grid grid-cols-3 gap-6">
        {movies.map((movie) => (
          <div key={movie._id} className="p-4 shadow rounded-lg bg-white">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="rounded-md mb-2"
            />
            <h2 className="text-lg font-bold">{movie.title}</h2>
            <p>
              {movie.genre} • {movie.duration} mins • {movie.rating}
            </p>
            <p className="text-sm mt-1">{movie.description}</p>
            <div className="mt-2">
              <strong>Showtimes:</strong>
              <ul>
                {movie.showtimes.map((time, idx) => (
                  <li key={idx}>{time}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    );
  }