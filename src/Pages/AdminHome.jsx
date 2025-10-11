import React, { useState, useEffect } from "react";
import "./AdminHome.css";
import { Link } from "react-router-dom";

/*
// Replace all sample data with MongoDB data in the future
// Sample data
const movie = {
  title: "The Witcher",
  summary:
    "Geralt of Rivia, a mutated monster hunter for hire, journeys toward his destiny in a turbulent world where people often prove more wicked than beasts.",
  tags: ["Action", "Fantasy", "TV-MA"],
  rating: 4.8,
  image:
    "https://static0.colliderimages.com/wordpress/wp-content/uploads/2023/04/en-gb_thewitchers3_main_4x5_rgb_pre.jpg"
};

// Sample now playing movies
const nowPlaying = [
  { id: 1, title: "Napoleon", img: "https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=800&auto=format&fit=crop" },
  { id: 2, title: "The Flash", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop" },
  { id: 3, title: "Oppenheimer", img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963f?q=80&w=800&auto=format&fit=crop" },
  { id: 4, title: "Tron", img: "https://images.unsplash.com/photo-1509326066960-c0fdbf69a3f0?q=80&w=800&auto=format&fit=crop" },
  { id: 5, title: "Barbie", img: "https://images.unsplash.com/photo-1514511542834-9c6432b3b0f4?q=80&w=800&auto=format&fit=crop" },
  { id: 6, title: "Air", img: "https://images.unsplash.com/photo-1495562569060-2eec283d3391?q=80&w=800&auto=format&fit=crop" },
  { id: 7, title: "Napoleon", img: "https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=800&auto=format&fit=crop" },
  { id: 8, title: "The Flash", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop" },
  { id: 9, title: "Oppenheimer", img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963f?q=80&w=800&auto=format&fit=crop" },
  { id: 10, title: "Tron", img: "https://images.unsplash.com/photo-1509326066960-c0fdbf69a3f0?q=80&w=800&auto=format&fit=crop" },
  { id: 11, title: "Barbie", img: "https://images.unsplash.com/photo-1514511542834-9c6432b3b0f4?q=80&w=800&auto=format&fit=crop" },
  { id: 12, title: "Air", img: "https://images.unsplash.com/photo-1495562569060-2eec283d3391?q=80&w=800&auto=format&fit=crop" }
];

// Sample coming soon movies
const comingSoon = [
  { id: 13,  title: "La La Land", img: "https://images.unsplash.com/photo-1502136969935-8d07100c3b95?q=80&w=800&auto=format&fit=crop" },
  { id: 14,  title: "Dune II",    img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop" },
  { id: 15,  title: "Blade",      img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop" },
  { id: 16, title: "Witcher S4", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop" },
  { id: 17, title: "Arcane",     img: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=800&auto=format&fit=crop" },
  { id: 18, title: "Marvels",    img: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop" }
];
*/

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
              style={{ backgroundImage: `url(${m.posterurl})` }}
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

export default function AdminHome() {
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

        setNowPlaying(moviesData.slice(0, 6));
        setComingSoon(moviesData.slice(6));
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

              {/* Or, since your DB has "genre", just show that */}
              {!movie.tags && <span className="tag">{movie.genre}</span>}
          </div>
            <div className="rating">
              <span className="stars">★★★★★</span>
              <span className="rating__num">{movie.reviews}</span>
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
