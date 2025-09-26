import React, { useRef, useState } from "react";
import "./Browse.css";

/* Sample genres - replace with MongoDB data in the future? */
const GENRES = [
  "Action", "Fantasy", "Mystery", "Suspense",
  "Thriller", "Romance", "Comedy", "Adventure",
    "Drama", "Sci-Fi", "Horror", "Animation", "Family",
    "Documentary", "Biography", "Crime", "Musical"
];

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

  // Clear all selections
  // const clear = () => setSelected(new Set());

  return (
    <main className="browse">
        {/* genre rail pushed to visible*/ }
      <GenreRail items={GENRES} selectedSet={selected} onToggle={toggle} />

      {/* TODO: use `selected` to filter your movie list */}
    </main>
  );
}
