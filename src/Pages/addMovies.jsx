// a lot of this file is still empty bc it has to connect to the db
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      navigate("/admin");
    } catch (err) {
      console.error("Add movie failed:", err);
    }
  };

  return (
    <div style={{padding: '40px', background: '#0b1020', color: 'white', minHeight: '100vh'}}>
      <h2>Add New Movie</h2>
      <form onSubmit={handleSubmit} style={{maxWidth: '500px', margin: '0 auto'}}>
        <input
          type="text"
          placeholder="Movie Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{width: '100%', padding: '10px', margin: '10px 0'}}
        />
        <input
          type="text"
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={{width: '100%', padding: '10px', margin: '10px 0'}}
        />
        <input
          type="url"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          style={{width: '100%', padding: '10px', margin: '10px 0'}}
        />
        <button type="submit" style={{
          background: 'linear-gradient(90deg, #8b14d1, #cc12cc)',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer'
        }}>
          Add Movie
        </button>
      </form>
    </div>
  );
}