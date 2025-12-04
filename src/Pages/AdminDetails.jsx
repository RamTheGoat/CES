import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AdminDetails.css";

export default function AdminDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [days, setDays] = useState([]);
  const navigate = useNavigate();

  // Fetch movie
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/movies/${id}`);
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Failed to fetch movie data.", error);
      }
    };

    const fetchShowtimes = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/showtimes/${id}`);
        const data = await response.json();
        setShowtimes(data);
        setDays(Array.from(new Set(data.map(showtime => showtime.date))));
      } catch (error) {
        console.error("Failed to fetch showtime data:", error.message);
      }
    };

    fetchMovie();
    fetchShowtimes();
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

        {/* Now Playing*/}
        {isNowPlaying && (
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
                  {(new Date(day)).toLocaleDateString("en-US", { dateStyle: "short" })}
                </button>
              ))}
            </div>

            {/* Time selection */}
            <div className="details_times">
              {showtimes.filter(showtime => showtime.date === days[selectedDay]).map((showtime, index) => (
                <div key={index} className="details_time-container">
                  <button
                    className="details_time-btn"
                    onClick={() => navigate(`/booking/${showtime._id}`, {
                      state: {
                        movieTitle: movie.title,
                        showtime: showtime.time,
                        date: showtime.date
                      }
                    })}
                  >
                    {showtime.time}
                  </button>
                </div>
              ))}
              
              {(!showtimes[selectedDay] || showtimes[selectedDay].length === 0) && (
                <p className="details_no-showtimes">No showtimes currently available for this movie</p>
              )}
            </div>
          </section>
        )}
        <section className="details_edit-section">
          <button 
            className="details_edit-btn"
            onClick={() => navigate(`/showtimes/${id}`)}
          >
            Edit Showtimes
          </button>
        </section>
      </div>
    </main>
  );
}