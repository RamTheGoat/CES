import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ManageShowtimes.css";

const ShowtimeItem = ({ showtime, onDelete }) => {
  const date = new Date(`${showtime.date} ${showtime.time}`);
  const dateString = date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="showtime-item">
      <div style={{textAlign: "left"}}>
        <h3 style={{margin: 0}}>{showtime.movieTitle}</h3>
        <p style={{color: "lightgray"}}>{showtime.showroomName} • {dateString}</p>
      </div>
      <button
        className="delete-button"
        onClick={() => onDelete(showtime._id)}
      >
        Delete
      </button>
    </div>
  );
}

export default function ManageShowtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [movie, setMovie] = useState({id: ''});
  const [showroom, setShowroom] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const { id } = useParams();

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/showtimes");
        const showtimesData = await res.json();
        setShowtimes(id ? showtimesData.filter(showtime => showtime.movieId === id) : showtimesData);
      } catch (error) {
        console.error("Failed to fetch showtimes:", error.message);
      }
    };

    const fetchShowrooms = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/showrooms");
        const showroomsData = await res.json();
        setShowrooms(showroomsData.map(showroom => ({
          id: showroom._id.toString(),
          name: showroom.name,
        })));
      } catch (error) {
        console.error("Failed to fetch showrooms:", error.message);
      }
    }

    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/movies");
        const moviesData = await res.json();
        setMovies(moviesData.map(movie => ({
          id: movie._id.toString(),
          title: movie.title,
        })));
        if (id) {
          const movie = moviesData.find(movie => movie._id.toString() === id);
          setMovie({ id: movie._id, title: movie.title });
        }
      } catch (error) {
        console.error("Failed to fetch movies:", error.message);
      }
    }

    fetchShowtimes();
    fetchShowrooms();
    fetchMovies();
  }, [id]);

  const handleAddShowtime = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/showtimes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: movie.id,
          movieTitle: movie.title,
          showroom: showroom,
          date,
          time,
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      else console.log(data.message);

      if (!id) setMovie({id: ''});
      setShowroom('');
      setDate('');
      setTime('');
      setShowtimes(prev => [...prev, data.showtime]);
    } catch (error) {
      console.error("Failed to add showtime:", error.message);
      alert(`Failed to add showtime: ${error.message}`);
    }
  };

  const handleDeleteShowtime = async (showtimeId) => {
    if (!window.confirm("Are you sure you want to delete this showtime?\nThis cannot be undone!")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/showtimes/${showtimeId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      else console.log(data.message);

      setShowtimes(prev => prev.filter(showtime => showtime._id !== showtimeId));
    } catch (error) {
      console.error("Delete showtime failed:", error.message);
    }
  }

  return (
    <main className="manage-showtimes">
      <h2>Manage Showtimes</h2>
      <form onSubmit={handleAddShowtime} className="showtime-form">
        {id ? (
          <input
            type="text"
            value={movie.title ?? "Movie"}
            style={movie.title ? {gridColumn: "1 / span 2"} : {gridColumn: "1 / span 2", color: "gray"}}
            className="showtime-form-display"
            readOnly
          />
        ) : (
          <select
            value={movie.id}
            onChange={e => setMovie({ id: e.target.value, title: e.target.options[e.target.selectedIndex].text })}
            style={{gridColumn: "1 / span 2"}}
            className="showtime-form-select"
            required
          >
            <option value="" disabled>Movie</option>
            {movies.map(movie => (
              <option key={movie.id} value={movie.id}>{movie.title}</option>
            ))}
          </select>
        )}
        <select
          value={showroom}
          onChange={e => setShowroom(e.target.value)}
          style={{gridColumn: "3 / span 2"}}
          className="showtime-form-select"
          required
        >
          <option value="" disabled>Showroom</option>
          {showrooms.map(showroom => (
            <option key={showroom.id} value={showroom.id}>{showroom.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          placeholder="Showing Date"
          onChange={e => setDate(e.target.value)}
          onKeyDown={e => e.preventDefault()}
          style={{gridColumn: "1 / span 2"}}
          className="showtime-form-input date-input"
          required
        />
        <input
          type="time"
          value={time}
          placeholder="Showing Time"
          onChange={e => setTime(e.target.value)}
          onKeyDown={e => e.preventDefault()}
          style={{gridColumn: "3 / span 2"}}
          className="showtime-form-input time-input"
          required
        />
        <button
          type="submit"
          className="showtime-form-submit"
          style={{gridColumn: "2 / span 2"}}
        >
          Add Showtime
        </button>
      </form>
      <div className="showtime-list">
        {showtimes.sort((a, b) => {
          const compareName = a.movieTitle.localeCompare(b.movieTitle);
          if (compareName !== 0) return compareName;

          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateA - dateB;
        }).map(showtime => {
          const showroomName = (showrooms.find(showroom => showroom.id === showtime.showroom) ?? {}).name ?? "Showroom";
          return <ShowtimeItem key={showtime._id} showtime={{ ...showtime, showroomName }} onDelete={handleDeleteShowtime} />
        })}
      </div>
    </main>
  );
}