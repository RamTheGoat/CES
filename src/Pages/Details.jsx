import React, { useState } from "react";
import "./Details.css";

// Data for Barbie movie - replace images in a bit
const movie = {
  title: "Barbie",
  description: "We love watching the Barbie movie! It’s so good! Almost as good as the original animated movies and animated show. Not quite better, but it does come close, if close was the distance between the moon and our tide. For all the people who love to watch real-life people (REAL PEOPLE) on their screens, this is the movie for you! I can almost guarantee that there are no AI people in this movie. I cannot say this with 100% certainty, however, because I am not trying to say my word is gospel. Any-who, please enjoy our live action rendition of these classic characters by Mattel",
  genres: ["Comedy", "Adventure", "Romance"],
  trailerUrl: "", // Will be added later
  bannerImage: "", // Will be added later
  galleryImages: ["", "", "", "", ""] // Will be added later
};

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
  const [selectedDay, setSelectedDay] = useState(0);
  const days = getNextSevenDays();

  return (
    <main className="details">
      {/* Header would go here, hpefully same as other pages */}
      
      {/* Movie banner */}
      <section 
        className="details__banner"
        style={{ backgroundImage: `url(${movie.bannerImage})` }} // will add in image in a bit
      />
      
      {/* Image gallery */}
      <section className="details__gallery">
        {movie.galleryImages.map((img, index) => (
          <div
            key={index}
            className="details__gallery-img" // im adding in the images in a bit
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
      </section>
      
      {/* Content sections */}
      <div className="details__content">
        {/* About section */}
        <section className="details__section">
          <h2 className="details__section-title">About {movie.title}</h2>
          <p className="details__description">{movie.description}</p>
        </section>
        
        {/* Genre section */}
        <section className="details__section">
          <h2 className="details__section-title">Genres</h2>
          <div className="details__genres">
            {movie.genres.map((genre) => (
              <span key={genre} className="details__genre-tag">{genre}</span>
            ))}
          </div>
        </section>
        
        {/* Trailer section */}
        <section className="details__section">
          <h2 className="details__section-title">Trailer</h2>
          <div className="details__trailer-container">
            {movie.trailerUrl ? (
              <iframe
                className="details__trailer-iframe"
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
        
        {/* Showtimes section */}
        <section className="details__section">
          <h2 className="details__section-title">Showtimes</h2>
          
          {/* Day selection */}
          <div className="details__days">
            {days.map((day, index) => (
              <button
                key={index}
                className={`details__day-btn ${selectedDay === index ? 'details__day-btn--active' : ''}`}
                onClick={() => setSelectedDay(index)}
              >
                {day}
              </button>
            ))}
          </div>
          
          {/* Time selection */}
          <div className="details__times">
            {showtimes[selectedDay].map((time, index) => (
              <button key={index} className="details__time-btn">
                {time}
              </button>
            ))}
          </div>
        </section>
        
        {/* Book tickets button */}
        <section className="details__book-section">
          <button className="details__book-btn">
            Book Your Tickets Today!
          </button>
        </section>
      </div>
    </main>
  );
}