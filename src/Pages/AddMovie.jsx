import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./AddMovie.css";

export default function AddMovie() {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [image, setImage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:4000/api/movies", { //gotta double check this later
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          genre: genre,
          posterurl: image
        })
      });
      navigate("/");
    } catch (err) {
      console.error("Add movie failed:", err);
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
          onChange={(e) => setTitle(e.target.value)}
          className="movie-form-input"
          required
        />
        <input
          type="text"
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="movie-form-input"
        />
        <input
          type="url"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="movie-form-input"
        />
        <button type="submit" className="movie-form-submit">
          Add Movie
        </button>
      </form>
    </div>
  );
}