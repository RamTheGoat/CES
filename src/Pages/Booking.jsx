import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Booking.css";

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get movie details from navigation state
  const { movieTitle = "Barbie", showtime = "7:00 PM", date = "Today" } = location.state || {};
  
  // Seat selection state
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  // Seat layout - rows A through G, 10 seats per row
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const seatsPerRow = 10;
  
  // Generate seats with some randomly occupied
  const generateSeats = () => {
    const seats = [];
    for (let row of rows) {
      const rowSeats = [];
      for (let i = 1; i <= seatsPerRow; i++) {
        const seatId = `${row}${i}`;
        // Randomly mark some seats as occupied (about 20%)
        const isOccupied = Math.random() > 0.8;
        rowSeats.push({ id: seatId, occupied: isOccupied });
      }
      seats.push({ row, seats: rowSeats });
    }
    return seats;
  };
  
  const [seatLayout] = useState(generateSeats());
  
  // Handle seat selection
  const handleSeatClick = (seat) => {
    if (seat.occupied) return;
    
    setSelectedSeats(prev => {
      if (prev.includes(seat.id)) {
        return prev.filter(id => id !== seat.id);
      } else {
        return [...prev, seat.id];
      }
    });
  };
  
  // Calculate total
  const ticketPrice = 12.99;
  const total = (selectedSeats.length * ticketPrice).toFixed(2);
  
  return (
    <main className="booking">
      {/* Movie info header */}
      <header className="booking_header">
        <h1 className="booking_title">{movieTitle}</h1>
        <p className="booking_showtime">{date} • {showtime}</p>
      </header>
      
      {/* Main content grid */}
      <div className="booking_content">
        {/* Left side - Seat selection */}
        <section className="booking_section">
          <h2 className="booking_section-title">Choose Your Seat(s)</h2>
          
          {/* Screen */}
          <div className="booking_screen">
            <div className="booking_screen-label">SCREEN</div>
          </div>
          
          {/* Seat grid with proper rows */}
          <div className="booking_seats-grid">
            {seatLayout.map(rowData => (
              <div key={rowData.row} className="booking_seat-row">
                <div className="booking_row-label">{rowData.row}</div>
                <div className="booking_seats-in-row">
                  {rowData.seats.map(seat => (
                    <button
                      key={seat.id}
                      className={`booking_seat ${
                        selectedSeats.includes(seat.id) ? 'booking_seat--selected' : ''
                      } ${
                        seat.occupied ? 'booking_seat--occupied' : ''
                      }`}
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.occupied}
                      aria-label={`Seat ${seat.id} ${
                        seat.occupied ? 'occupied' : selectedSeats.includes(seat.id) ? 'selected' : 'available'
                      }`}
                    >
                      {seat.id.slice(1)} {/* Show seat number */}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Seat legend */}
          <div className="booking_legend">
            <div className="booking_legend-item">
              <div className="booking_legend-color booking_legend-color--available"></div>
              <span>Available</span>
            </div>
            <div className="booking_legend-item">
              <div className="booking_legend-color booking_legend-color--selected"></div>
              <span>Selected</span>
            </div>
            <div className="booking_legend-item">
              <div className="booking_legend-color booking_legend-color--occupied"></div>
              <span>Occupied</span>
            </div>
          </div>
        </section>
        
        {/* Right side - Order summary */}
        <section className="booking_order">
          <h3 className="booking_order-title">Order Summary</h3>
          
          <div className="booking_order-detail">
            <span className="booking_order-label">Movie</span>
            <span className="booking_order-value">{movieTitle}</span>
          </div>
          
          <div className="booking_order-detail">
            <span className="booking_order-label">Showtime</span>
            <span className="booking_order-value">{date}<br/>{showtime}</span>
          </div>
          
          <div className="booking_order-detail">
            <span className="booking_order-label">Tickets</span>
            <span className="booking_order-value">{selectedSeats.length}</span>
          </div>
          
          <div className="booking_order-detail">
            <span className="booking_order-label">Seats</span>
            <span className="booking_seats-list">
              {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
            </span>
          </div>
          
          <div className="booking_total">
            <span>TOTAL</span>
            <span>${total}</span>
          </div>
        </section>
      </div>
      
      {/* Action buttons */}
      <div className="booking_actions">
        <button 
          className="booking_btn booking_btn--back"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        
        <button 
          className="booking_btn booking_btn--proceed"
          disabled={selectedSeats.length === 0}
        >
          Proceed to Payment
        </button>
      </div>
    </main>
  );
}