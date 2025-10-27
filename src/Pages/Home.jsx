import React, { useState, useEffect } from "react";
import "./Home.css";
import { Link } from "react-router-dom";


// Function for movie cards
function Rail({ title, items }) {
  return (
    <section className="rail">
      <h2 className="rail__title">{title}</h2>
      <div className="rail__track">
        {items.map((m) => (
          <Link ey={m.id} to={`/details/${m._id}`} className="card-link">
            <article
              className="card"
              style={{ backgroundImage: `url(${m.posterUrl})` }}
              aria-label={m.title}
              title={m.title}
            >
              <div className="card__fade" />
            </article>
          </Link>
        ))}
      </div>

      {title === "Now Playing" && (
        <div className="times"> 
        </div>
      )}
    </section>
  );
}

export default function Home() {
  // New Code
  const [movie, setMovie] = useState(null);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/movies");
        const moviesData = await res.json();

        setMovie(moviesData[0]);

        setNowPlaying(moviesData.filter((m) => m.status === "Now Playing"));
        setComingSoon(moviesData.filter((m) => m.status === "Coming Soon"));
        /*
        setNowPlaying(moviesData.(0, 6));
        setComingSoon(moviesData.slice(6));
        */
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      }
    };
    fetchMovies();
  }, []);

  // Render a loading state while data is being fetched
  if (!movie) return <p>Loading...</p>;

  return (
    <main className="home">
      {/* MOVIE */}
      <section
        className="movie"
        style={{ backgroundImage: `url(${movie.bannerImage})` }}
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

              {/* Or, since your DB has "genre", just show that */}
              {!movie.tags && <span className="tag">{movie.genre.join("/")}</span>}
          </div>
            <div className="rating">
              <span className="stars">★★★★★</span>
              <div className="rating__num">
                <p>IMDb: {movie.review?.IMDb}</p>
                <p>Rotten Tomatoes: {movie.review?.RottenTomatoes}</p>
                <p>Letterboxd: {movie.review?.Letterboxd}</p>
              </div>
            </div>
          </div>

          <div className="movie__actions">
            <button className="btn btn--primary">Watch Movie</button>
              <button className="btn btn--ghost">More Info</button>
          </div>
        </div>
      </section>

      {/* RAILS */}
      <Rail title="Now Playing" items={nowPlaying} />
      <Rail title="Coming Soon" items={comingSoon} />
    </main>
  );
}
