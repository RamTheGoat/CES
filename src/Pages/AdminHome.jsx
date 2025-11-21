import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminHome.css";

// Function for movie cards
function Rail({ title, items, showDeleteMode, onDeleteMovie }) {
  return (
    <section className="rail">
      { title ? <h2 className="rail__title">{title}</h2> : <></> }
      <div className="rail__track">
        {items.map((m) => {
          const link = showDeleteMode ? null : `/details/${m._id}`;
          const action = () => { if (showDeleteMode) onDeleteMovie(m._id) };
          const classes = `card__fade${showDeleteMode ? " card-delete" : ""}`;

          return <Link key={m._id} to={link} onClick={action} className="card-link">
            <article
              className="card"
              style={{ backgroundImage: `url(${m.posterUrl})` }}
              aria-label={m.title}
              title={m.title}
            >
              <div className={classes}>
                <span className="material-symbols-outlined">delete</span>
              </div>
            </article>
          </Link>
        })}
      </div>

      {title === "Now Playing" && (
        <div className="times"> 
        </div>
      )}
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

        setNowPlaying(moviesData.filter((m) => m.status === "Now Playing"));
        setComingSoon(moviesData.filter((m) => m.status === "Coming Soon"));
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      }
    };
    fetchMovies();
  }, []);

  // this is editing movie stuff
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const handleDeleteMovie = async (movieId) => {
    if (window.confirm("Delete this movie?")) {
      try {
        const res = await fetch(`http://localhost:4000/api/movies/${movieId}`, {
          method: "DELETE",
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        else console.log(data.message);

        // Update local data
        setNowPlaying(prev => prev.filter(m => m._id !== movieId));
        setComingSoon(prev => prev.filter(m => m._id !== movieId));
        setMovie(nowPlaying[0]);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

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

      {/* ADMIN BUTTONS */}
      <div className="admin-actions-container">
        <h2 className="rail__title">Now Playing</h2>
        <div>
          <button
            className="admin-action-btn"
            onClick={() => navigate("/add-movie")}
          >
            Add Movie
          </button>
          <button
            className="admin-action-btn"
            onClick={() => setShowDeleteMode(!showDeleteMode)}
          >
            {showDeleteMode ? "Cancel Delete" : "Delete Movie"}
          </button>
        </div>
      </div>

      {/* RAILS */}
      <Rail
        items={nowPlaying}
        showDeleteMode={showDeleteMode}
        onDeleteMovie={handleDeleteMovie}
      />
      <Rail
        title="Coming Soon"
        items={comingSoon}
        showDeleteMode={showDeleteMode}
        onDeleteMovie={handleDeleteMovie}
      />
    </main>
  );
}
