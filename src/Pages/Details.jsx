import React, { useState, useEffect } from "react";
import "./Details.css";
import { useNavigate, useParams } from "react-router-dom";

// Generate about a week of days to choose from
const getNextSevenDays = () => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
  }
  return days;
};

// Sample showtimes for each day
const showtimes = {
  0: ["1:00 PM", "4:00 PM", "7:00 PM", "10:00 PM"],
  1: ["1:30 PM", "4:30 PM", "7:30 PM", "10:30 PM"],
  2: ["2:00 PM", "5:00 PM", "8:00 PM", "11:00 PM"],
  3: ["12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM"],
  4: ["1:00 PM", "4:00 PM", "7:00 PM", "10:00 PM"],
  5: ["2:30 PM", "5:30 PM", "8:30 PM", "11:30 PM"],
  6: ["11:00 AM", "2:00 PM", "5:00 PM", "8:00 PM"]
};

export default function Details() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const days = getNextSevenDays();
  const navigate = useNavigate();

  // Fetch movie
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/movies/${id}`);
        const data = await response.json();
        console.log("Fetched movie:", data);
        setMovie(data);
      } catch (error) {
        console.error("Failed to fetch movie data.", error);
      }
    };
    fetchMovie();
  }, [id]);

  if (!movie) return <p>Loading...</p>;
  else if (!movie.title) return (
    <main className="details">
      <h2 style={{padding: "100px"}}>Movie Not Found!</h2>
    </main>
  );

  // Determine if movie is "Now Playing"
  const isNowPlaying = movie.status === "Now Playing";

  return (
    <main className="details">
      {/* Movie banner */}
      <section
        className="details_banner"
        style={{ backgroundImage: `url(${movie.bannerImage || "placeholder-url-here"})` }}
      />

      {/* Image gallery */}
      <section className="details_gallery">
        {(movie.galleryImages || []).map((img, index) => (
          <div
            key={index}
            className="details_gallery-img"
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
      </section>

      {/* Content sections */}
      <div className="details_content">
        {/* About section */}
        <section className="details_section">
          <h2 className="details_section-title">About {movie.title}</h2>
          <p className="details_description">{movie.synopsis}</p>

          <div className="details_info">
            <p><strong>Cast:</strong> {movie.cast.join(", ") || "N/A"}</p>
            <p><strong>Producers:</strong> {movie.producer.join(", ") || "N/A"}</p>
            <p><strong>Director:</strong> {movie.director.join(", ") || "N/A"}</p>
            <p><strong>Film Rating:</strong> {movie.filmRating || "N/A"}</p>

            <div>
              <strong>Reviews:</strong>
              <p>IMDb: {movie.review?.IMDb || "N/A"}</p>
              <p>Rotten Tomatoes: {movie.review?.RottenTomatoes || "N/A"}</p>
              <p>Letterboxd: {movie.review?.Letterboxd || "N/A"}</p>
            </div>
          </div>
        </section>

        {/* Genre section */}
        <section className="details_section">
          <h2 className="details_section-title">Genres</h2>
          <div className="details_genres">
            {Array.isArray(movie.genre)
              ? movie.genre.map((g) => <span key={g} className="details_genre-tag">{g}</span>)
              : <span className="details_genre-tag">{movie.genre}</span>
            }
          </div>
        </section>

        {/* Trailer section */}
        <section className="details_section">
          <h2 className="details_section-title">Trailer</h2>
          <div className="details_trailer-container">
            {movie.trailerUrl ? (
              <iframe
                className="details_trailer-iframe"
                src={movie.trailerUrl}
                title={`${movie.title} Trailer`}
                allowFullScreen
              />
            ) : (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--muted)'
              }}>
                Trailer link will be added here
              </div>
            )}
          </div>
        </section>

        {/* Showtimes section — only for Now Playing movies */}
        {isNowPlaying && showtimes[selectedDay] && (
          <section className="details_section">
            <h2 className="details_section-title">Showtimes</h2>

            {/* Day selection */}
            <div className="details_days">
              {days.map((day, index) => (
                <button
                  key={index}
                  className={`details_day-btn ${selectedDay === index ? 'details_day-btn--active' : ''}`}
                  onClick={() => setSelectedDay(index)}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Time selection */}
            <div className="details_times">
              {showtimes[selectedDay].map((time, index) => (
                <button
                  key={index}
                  className="details_time-btn"
                  onClick={() => navigate("/booking", {
                    state: {
                      movieTitle: movie.title,
                      showtime: time,
                      date: days[selectedDay]
                    }
                  })}
                >
                  {time}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Book tickets button */}
        <section className="details_book-section">
          {isNowPlaying ? (
            <button className="details_book-btn">
              Book Your Tickets Today!
            </button>
          ) : (
            <p className="coming-soon-text">Coming Soon</p>
          )}
        </section>
      </div>
    </main>
  );
}
