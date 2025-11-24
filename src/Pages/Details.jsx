import React, { useState, useEffect } from "react";
import "./Details.css";
import { useNavigate, useParams } from "react-router-dom";

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [dbShowtimes, setDbShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // Fetch movie and showtimes
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/movies/${id}`);
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Failed to fetch movie data:", error.message);
      }
    };

    const fetchShowtimes = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/showtimes?movieId=${id}`);
        const data = await res.json();
        setDbShowtimes(data);

        // Auto-select first available date
        if (data.length > 0) {
          setSelectedDate(data[0].date);
        }
      } catch (error) {
        console.error("Error loading showtimes:", error);
      }
    };

    fetchMovie();
    fetchShowtimes();
  }, [id]);

  if (!movie) return <p>Loading...</p>;
  if (!movie.title) {
    return (
      <main className="details">
        <h2 style={{ padding: "100px" }}>Movie Not Found!</h2>
      </main>
    );
  }

  const isNowPlaying = movie.status === "Now Playing";

  // Group showtimes by date
  const showtimesByDate = dbShowtimes.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const availableDates = Object.keys(showtimesByDate);

  return (
    <main className="details">
      {/* Banner */}
      <section
        className="details_banner"
        style={{ backgroundImage: `url(${movie.bannerImage || ""})` }}
      />

      {/* Gallery Images */}
      <section className="details_gallery">
        {(movie.galleryImages || []).map((img, index) => (
          <div
            key={index}
            className="details_gallery-img"
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
      </section>

      <div className="details_content">
        {/* About Section */}
        <section className="details_section">
          <h2 className="details_section-title">About {movie.title}</h2>
          <p className="details_description">{movie.synopsis}</p>

          <div className="details_info">
            <p><strong>Cast:</strong> {(movie.cast || []).join(", ") || "N/A"}</p>
            <p><strong>Producers:</strong> {(movie.producer || []).join(", ") || "N/A"}</p>
            <p><strong>Director:</strong> {(movie.director || []).join(", ") || "N/A"}</p>
            <p><strong>Film Rating:</strong> {movie.filmRating || "N/A"}</p>

            <div>
              <strong>Reviews:</strong>
              <p>IMDb: {movie.review?.IMDb || "N/A"}</p>
              <p>Rotten Tomatoes: {movie.review?.RottenTomatoes || "N/A"}</p>
              <p>Letterboxd: {movie.review?.Letterboxd || "N/A"}</p>
            </div>
          </div>
        </section>

        {/* Genres Section */}
        <section className="details_section">
          <h2 className="details_section-title">Genres</h2>
          <div className="details_genres">
            {Array.isArray(movie.genre)
              ? movie.genre.map((g) => <span key={g} className="details_genre-tag">{g}</span>)
              : <span className="details_genre-tag">{movie.genre}</span>
            }
          </div>
        </section>

        {/* Trailer Section */}
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
              <div className="no-trailer">Trailer link will be added here</div>
            )}
          </div>
        </section>

        {/* Showtimes Section */}
        {isNowPlaying && availableDates.length > 0 && (
          <section className="details_section">
            <h2 className="details_section-title">Showtimes</h2>

            {/* Dates */}
            <div className="details_days">
              {availableDates.map((date) => (
                <button
                  key={date}
                  className={`details_day-btn ${selectedDate === date ? "details_day-btn--active" : ""}`}
                  onClick={() => setSelectedDate(date)}
                >
                  {date}
                </button>
              ))}
            </div>

            {/* Times */}
            <div className="details_times">
              {(showtimesByDate[selectedDate] || []).map((s) => (
                <button
                  key={s._id}
                  className="details_time-btn"
                  onClick={() =>
                    navigate(`/booking/${s._id}`, { // <-- Pass showtimeId in URL
                      state: {
                        movieTitle: movie.title,
                        showtime: s.time,
                        date: selectedDate,
                      },
                    })
                  }
                >
                  {s.time}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Book Button Section */}
        <section className="details_book-section">
          {isNowPlaying ? (
            <button className="details_book-btn">Book Your Tickets Today!</button>
          ) : (
            <p className="coming-soon-text">Coming Soon</p>
          )}
        </section>
      </div>
    </main>
  );
}
