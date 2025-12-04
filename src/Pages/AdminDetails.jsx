import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AdminDetails.css";

export default function AdminDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [dbShowtimes, setDbShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [showrooms, setShowrooms] = useState([]);
  const [selectedShowroom, setSelectedShowroom] = useState(null);
  const [loadingShowrooms, setLoadingShowrooms] = useState(true);

  // Fetch movie
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

    fetchMovie();
  }, [id]);

  // Fetch showrooms
  useEffect(() => {
    const fetchShowrooms = async () => {
      try {
        setLoadingShowrooms(true);
        const response = await fetch('http://localhost:4000/api/showrooms');
        const data = await response.json();
        setShowrooms(data);
        
        // Select first showroom by default if available
        if (data.length > 0) {
          setSelectedShowroom(data[0]);
        }
      } catch (error) {
        console.error("Error fetching showrooms:", error);
      } finally {
        setLoadingShowrooms(false);
      }
    };

    fetchShowrooms();
  }, []);

  // Fetch showtimes based on selected showroom
  // In Details.jsx, update the fetchShowtimes useEffect:
  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!selectedShowroom || !movie) return;
      
      try {
        // Fetch showtimes for this movie AND selected showroom
        const res = await fetch(
          `http://localhost:4000/api/showtimes/movie/${id}?showroom=${selectedShowroom._id}`
        );
        const data = await res.json();
        setDbShowtimes(data);

        // Auto-select first available date
        if (data.length > 0) {
          setSelectedDate(data[0].date);
        } else {
          setSelectedDate("");
        }
      } catch (error) {
        console.error("Error loading showtimes:", error);
        setDbShowtimes([]);
      }
    };

    fetchShowtimes();
  }, [id, selectedShowroom, movie]);

  if (!movie) return <p>Loading...</p>;
  else if (!movie.title) return (
    <main className="details">
      <h2 style={{padding: "100px"}}>Movie Not Found!</h2>
    </main>
  );

  // Determine if movie is "Now Playing"
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

        {/* Showrooms & Showtimes Section */}
        {isNowPlaying && (
          <section className="details_section">
            <h2 className="details_section-title">Showtimes</h2>
            {/* Showroom Selector */}
            <div className="details_showroom-section">
              <h3 className="details_subtitle">Select Cinema</h3>
              
              {loadingShowrooms ? (
                <p>Loading cinemas...</p>
              ) : showrooms.length > 0 ? (
                <div className="details_showrooms">
                  {showrooms.map((showroom) => (
                    <button
                      key={showroom._id}
                      className={`details_showroom-btn ${
                        selectedShowroom?._id === showroom._id 
                          ? "details_showroom-btn--active" 
                          : ""
                      }`}
                      onClick={() => setSelectedShowroom(showroom)}
                    >
                      <div className="showroom-info">
                        <span className="showroom-name">{showroom.name}</span>
                        <span className="showroom-location">{showroom.location}</span>
                        {showroom.screenNumber && (
                          <span className="showroom-screen">Screen {showroom.screenNumber}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p>No cinemas available</p>
              )}
            </div>

            {/* Selected Showroom Info */}
            {selectedShowroom && (
              <div className="selected-showroom-info">
                <p>
                  <strong>Selected Cinema:</strong> {selectedShowroom.name}
                  {selectedShowroom.location && ` • ${selectedShowroom.location}`}
                  {selectedShowroom.screenNumber && ` • Screen ${selectedShowroom.screenNumber}`}
                </p>
              </div>
            )}

            {/* Dates (only show if we have showtimes) */}
            {availableDates.length > 0 ? (
              <>
                <div className="details_days">
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      className={`details_day-btn ${
                        selectedDate === date ? "details_day-btn--active" : ""
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      {new Date(date).toLocaleDateString("en-US", { dateStyle: "short" })}
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
                        navigate(`/booking/${s._id}`, {
                          state: {
                            movieTitle: movie.title,
                            showtime: s.time,
                            date: selectedDate,
                            cinemaName: selectedShowroom?.name || "Cinema",
                            showroomId: selectedShowroom?._id,
                          },
                        })
                      }
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              </>
            ) : selectedShowroom ? (
              <p className="no-showtimes-message">
                No showtimes available at {selectedShowroom.name} for this movie.
              </p>
            ) : null}
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