import React, { useRef, useState, useMemo } from "react";
import "./Browse.css";
import { movies } from "../Components/movies.js";

/* Sample genres - replace with MongoDB data in the future? */
const GENRES = [
  "Action", "Fantasy", "Mystery", "Suspense",
  "Thriller", "Romance", "Comedy", "Adventure",
    "Drama", "Sci-Fi", "Horror", "Animation", "Family",
    "Documentary", "Biography", "Crime", "Musical"
];

const norm = (s) => s?.toLowerCase().trim();


function GenreRail({ items, selectedSet, onToggle }) {
    /* horizontal scroll feature */
  const trackRef = useRef(null);
  const scrollBy = (dx) => trackRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <section className="rail">
      <h2 className="rail__title">Filter by Genre</h2>
      <div className="rail__controls">
        {/* left scroll button */ }
        <button type="button" className="rail__btn" aria-label="Scroll left" onClick={() => scrollBy(-240)}>‹</button>
        
        {/* scrollable track of genre tags */ }
        <div className="rail__track" ref={trackRef}>
          {items.map((tag) => {
            const active = selectedSet.has(tag);
            return (
              <button
                key={tag}
                type="button"
                className={`chip ${active ? "chip--active" : ""}`}
                onClick={() => onToggle(tag)}
                aria-pressed={active}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* right scroll button */ }
        <button type="button" className="rail__btn" aria-label="Scroll right" onClick={() => scrollBy(240)}>›</button>
      </div>
    </section>
  );
}

function MovieCard({ movie }) {
  return (
    <article className="movie-card">
      {movie.image && <img src={movie.image} alt={movie.title} className="movie-card__img" />}
      <div className="movie-card__body">
        <h4 className="movie-card__title">{movie.title}</h4>
        {movie.year && <p className="movie-card__meta">{movie.year}</p>}
        {Array.isArray(movie.genres) && (
          <div className="movie-card__tags">
            {movie.genres.slice(0, 3).map((g) => (
              <span key={g} className="tag">{g}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Browse() {
  // allow multiple selections
  const [selected, setSelected] = useState(new Set());

  const toggle = (tag) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  };

  const MATCH_MODE = "ALL";

  const filtered = React.useMemo(() => {
    const selectedArr = [...selected].map(norm);
  if (selectedArr.length === 0) return movies;

  return movies.filter((m) => {
    const mg = Array.isArray(m.genres) ? m.genres.map(norm) : [];
    return MATCH_MODE === "ALL"
      ? selectedArr.every((g) => mg.includes(g))   // must contain ALL selected
      : selectedArr.some((g) => mg.includes(g));   // contains ANY selected
  });
  }, [selected, movies]);

  return (
    <main className="browse">
      <GenreRail items={GENRES} selectedSet={selected} onToggle={toggle} />

      {/* Active filters + count */}
      <div className="results-bar">
        <div className="active-filters">
          {[...selected].map((g) => (
            <button key={g} className="chip chip--active" onClick={() => toggle(g)}>
              {g} ✕
            </button>
          ))}
        </div>
        <span className="results-count">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <p className="empty">No matches. Try different genres.</p>
      ) : (
        <section className="grid">
          {filtered.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </section>
      )}
    </main>
  );
}