import React, { useState, useEffect } from "react";
import "./AdminHome.css";
import { Link, useNavigate } from "react-router-dom";

function Rail({ title, items }) {
  return (
    <section className="rail">
      <h2 className="rail__title">{title}</h2>
      <div className="rail__track">
        {items.map((m) => (
          <Link key={m._id || m.id} to={`/details/${m._id}`} className="card-link">
            <article
              className="card"
              style={{ backgroundImage: `url(${m.posterurl})` }}
              aria-label={m.title}
              title={m.title}
            >
              <div className="card__fade" />
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function AdminHome() {
  const [movie, setMovie] = useState(null);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/movies");
        const moviesData = await res.json();

        setMovie(moviesData[0]);
        setNowPlaying(moviesData.slice(0, 6));
        setComingSoon(moviesData.slice(6));
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      }
    };

    fetchMovies();
  }, []);

  if (!movie) return <p>Loading...</p>;

  return (
    <main className="home">
      {/* BUTTON directly below header */}
      <div className="edit-showtimes-container">
        <button
          className="edit-showtimes-btn"
          onClick={() => navigate("/edit-showtimes")}
        >
          ✏️ Edit Showtimes
        </button>
      </div>

      {/* Featured Movie */}
      <section
        className="movie"
        style={{ backgroundImage: `url(${movie.posterurl})` }}
      >
        <div className="movie__scrim" />
        <div className="movie__content">
          <h1 className="movie__title">{movie.title}</h1>
          <p className="movie__summary">{movie.synopsis}</p>

          <div className="movie__meta">
            <div className="tags">
              {movie.tags?.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
              {!movie.tags && <span className="tag">{movie.genre}</span>}
            </div>
            <div className="rating">
              <span className="stars">★★★★★</span>
              <span className="rating__num">{movie.reviews}</span>
            </div>
          </div>
        </div>
      </section>

      <Rail title="Now Playing" items={nowPlaying} />
      <Rail title="Coming Soon" items={comingSoon} />
    </main>
  );
}
