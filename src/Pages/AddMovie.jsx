import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./AddMovie.css";

export default function AddMovie() {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [cast, setCast] = useState('');
  const [producer, setProducer] = useState('');
  const [director, setDirector] = useState('');
  const [rating, setRating] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [IMDBReview, setIMDBReview] = useState('');
  const [letterboxReview, setLetterboxReview] = useState('');
  const [rottenTomatoesReview, setRottenTomatoesReview] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          genre: genre.split(",").map(g => g.trim()),
          cast: cast.split(",").map(c => c.trim()),
          producer: producer.split(",").map(p => p.trim()),
          director: director.split(",").map(d => d.trim()),
          synopsis: synopsis,
          review: {
              IMDb: `${IMDBReview}/10`,
              Letterboxd: `${letterboxReview}/5`,
              RottenTomatoes: `${rottenTomatoesReview}%`
          },
          trailerUrl: trailerUrl,
          posterUrl: posterUrl,
          bannerImage: bannerUrl,
          status: status
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      else console.log(data.message);

      navigate(`/details/${data.movie._id}`);
    } catch (err) {
      console.error("Add movie failed:", err.message);
    }
  };

  return (
    <div className="add-movie">
      <h2>Add New Movie</h2>
      <form onSubmit={handleSubmit} className="add-movie-form">
        <input
          type="text"
          placeholder="Movie Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{gridColumn: "1 / span 4"}}
          className="movie-form-input"
          required
        />
        <input
          type="text"
          placeholder="Genre(s)"
          value={genre}
          onChange={e => setGenre(e.target.value)}
          style={{gridColumn: "1 / span 4"}}
          className="movie-form-input"
          required
        />
        <input
          type="text"
          placeholder="Cast"
          value={cast}
          onChange={e => setCast(e.target.value)}
          style={{gridColumn: "1 / span 4"}}
          className="movie-form-input"
          required
        />
        <input
          type="text"
          placeholder="Producer(s)"
          value={producer}
          onChange={e => setProducer(e.target.value)}
          style={{gridColumn: "1 / span 2"}}
          className="movie-form-input"
          required
        />
        <input
          type="text"
          placeholder="Director(s)"
          value={director}
          onChange={e => setDirector(e.target.value)}
          style={{gridColumn: "3 / span 2"}}
          className="movie-form-input"
          required
        />
        <textarea
          placeholder="Movie Synopsis"
          value={synopsis}
          rows={5}
          maxLength={250}
          onChange={e => setSynopsis(e.target.value)}
          style={{gridColumn: "1 / span 4"}}
          className="movie-form-input"
          required
        />
        <input
          type="text"
          placeholder="Trailer Video URL"
          value={trailerUrl}
          onChange={e => setTrailerUrl(e.target.value)}
          style={{gridColumn: "1 / span 1"}}
          className="movie-form-input"
          required
        />
        <input
          type="text"
          placeholder="Poster Image URL"
          value={posterUrl}
          onChange={e => setPosterUrl(e.target.value)}
          style={{gridColumn: "2 / span 2"}}
          className="movie-form-input"
          required
        />
        <input
          type="text"
          placeholder="Banner Image URL"
          value={bannerUrl}
          onChange={e => setBannerUrl(e.target.value)}
          style={{gridColumn: "4 / span 1"}}
          className="movie-form-input"
          required
        />
        <input
          type="number"
          placeholder="IMBd Review Score"
          value={IMDBReview}
          onChange={e => setIMDBReview(e.target.value)}
          style={{gridColumn: "1 / span 1"}}
          className="movie-form-input"
          step={0.1}
        />
        <input
          type="number"
          placeholder="Letterboxd Review Score"
          value={letterboxReview}
          onChange={e => setLetterboxReview(e.target.value)}
          style={{gridColumn: "2 / span 2"}}
          className="movie-form-input"
          step={0.1}
        />
        <input
          type="number"
          placeholder="Rotten Tomatoes Review Score"
          value={rottenTomatoesReview}
          onChange={e => setRottenTomatoesReview(e.target.value)}
          style={{gridColumn: "4 / span 1"}}
          className="movie-form-input"
          step={0.1}
        />
        <select
          value={rating}
          onChange={e => setRating(e.target.value)}
          style={{gridColumn: "1 / span 2"}}
          className="movie-form-select"
          required
        >
          <option value="" disabled>MPAA Rating</option>
          <option value="G">G</option>
          <option value="PG">PG</option>
          <option value="PG-13">PG-13</option>
          <option value="R">R</option>
        </select>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{gridColumn: "3 / span 2"}}
          className="movie-form-select"
          required
        >
          <option value="" disabled>Movie Status</option>
          <option value="Now Playing">Now Playing</option>
          <option value="Coming Soon">Coming Soon</option>
        </select>
        <button
          type="submit"
          className="movie-form-submit"
          style={{gridColumn: "2 / span 2"}}
        >
          Add Movie
        </button>
      </form>
    </div>
  );
}