import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./Booking.css";

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showtimeId } = useParams();

  const { movieTitle = "Movie", date = "", showtime = "" } = location.state || {};

  const ticketPrices = { adult: 12, child: 8, senior: 10 };

  const [adultTickets, setAdultTickets] = useState(1);
  const [childTickets, setChildTickets] = useState(0);
  const [seniorTickets, setSeniorTickets] = useState(0);
  const totalTickets = adultTickets + childTickets + seniorTickets;

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLayout, setSeatLayout] = useState([]);
  const [loading, setLoading] = useState(false);

  const getUserId = () => {
    const u = localStorage.getItem("user");
    if (!u) return null;
    try {
      return JSON.parse(u)._id;
    } catch {
      return null;
    }
  };

  // Fetch booked/held seats from server
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/showtimes/${showtimeId}/seats`);
        const data = await res.json();

        // Double Check The Data
        console.log("Server response:", data);
        console.log("Sold seats:", data.soldSeats);        

        const rows = "ABCDEF".split("").map((row) => ({
          row,
          seats: Array.from({ length: 10 }, (_, i) => {
            const id = `${row}${i + 1}`;

            const currentUserId = getUserId();
            const isSold = Array.isArray(data.soldSeats) && data.soldSeats.includes(id);
            const heldByUserId = data.heldBy && data.heldBy[id];

            // check seat status
            let status = "available";

            if (isSold) {
              status = "sold"; 
            } else if (heldByUserId) {

              if (heldByUserId === currentUserId) {
                status = "heldByMe"; 
              } else {
                status = "held";
              }
            }
            
            return { 
              id, 
              status,
              heldBy: heldByUserId || null 
            };
          }),
        }));
        setSeatLayout(rows);
      } catch (err) {
        console.error("Error fetching seats:", err);
      }
    };

    fetchSeats();
  }, [showtimeId]);

  const handleSeatClick = (seat) => {
    const userId = getUserId();
    if (!userId) return alert("Please log in to select seats.");

    if (seat.status === "sold") return;
    if (seat.status === "held" && seat.heldBy !== userId) return;

    const isSelected = selectedSeats.includes(seat.id);
    if (!isSelected && selectedSeats.length >= totalTickets) return;

    setSelectedSeats((prev) =>
      isSelected ? prev.filter((s) => s !== seat.id) : [...prev, seat.id]
    );
  };

  const totalPrice =
    adultTickets * ticketPrices.adult +
    childTickets * ticketPrices.child +
    seniorTickets * ticketPrices.senior;

  const handleProceed = async () => {
    const userId = getUserId();
    if (!userId) return alert("You must be logged in.");
    if (!showtimeId) return alert("Showtime missing.");
    if (selectedSeats.length !== totalTickets)
      return alert("Select seats matching ticket count.");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/hold-seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, showtimeId, seats: selectedSeats }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Unable to hold seats.");
        setLoading(false);
        return;
      }

      navigate("/checkout", {
        state: {
          holdId: data.holdId,
          seats: selectedSeats,
          tickets: { adult: adultTickets, child: childTickets, senior: seniorTickets },
          showtime: { movieTitle, date, time: showtime, id: showtimeId },
          totalPrice: totalPrice.toFixed(2),
          holdExpiresAt: data.expiresAt,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Error holding seats.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="booking">
      <header className="booking_header">
        <h1 className="booking_title">{movieTitle}</h1>
        <p className="booking_showtime">{date} • {showtime}</p>
      </header>

      <div className="booking_content">
        {/* Seat selection */}
        <section className="booking_section">
          <h2 className="booking_section-title">Choose Your Seats & Tickets</h2>

          <div className="ticket-selection">
            {["adult", "child", "senior"].map((type) => (
              <div key={type} className="ticket-input">
                <label>{type.charAt(0).toUpperCase() + type.slice(1)} (${ticketPrices[type]})</label>
                <input
                  type="number"
                  min="0"
                  value={{ adult: adultTickets, child: childTickets, senior: seniorTickets }[type]}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    if (type === "adult") setAdultTickets(val);
                    else if (type === "child") setChildTickets(val);
                    else setSeniorTickets(val);
                  }}
                />
              </div>
            ))}
          </div>

          <div className="booking_seats-grid">
            {seatLayout.map((rowData) => (
              <div key={rowData.row} className="booking_seat-row">
                <div className="booking_row-label">{rowData.row}</div>
                <div className="booking_seats-in-row">
                  {rowData.seats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat.id);
                    const isHeldByOther = seat.status === "held" && seat.heldBy !== getUserId();
                    const isHeldByMe = seat.status === "heldByMe";
                    const isSold = seat.status === "sold";

                    let seatClass = "booking_seat";
                     if (isSold) seatClass += " booking_seat--sold";
                     else if (isHeldByOther) seatClass += " booking_seat--held";
                     else if (isHeldByMe) seatClass += " booking_seat--held-by-me";
                     else if (isSelected) seatClass += " booking_seat--selected";

                    const seatDisabled = isSold || isHeldByOther;

                    return (
                      <button
                        key={seat.id}
                        className={seatClass}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seatDisabled}
                      >
                        {seat.id.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend colors */}
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
              <div className="booking_legend-color booking_legend-color--sold"></div>
              <span>Sold</span>
            </div>
            <div className="booking_legend-item">
              <div className="booking_legend-color booking_legend-color--held"></div>
              <span>Held</span>
            </div>
          </div>          
        </section>

        {/* Order summary */}
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
            <span className="booking_order-value">{totalTickets}</span>
          </div>
          <div className="booking_order-detail">
            <span className="booking_order-label">Seats</span>
            <span className="booking_seats-list">
              {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None selected"}
            </span>
          </div>
          <div className="booking_total">
            <span>TOTAL</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </section>
      </div>

      <div className="booking_actions">
        <button className="booking_btn booking_btn--back" onClick={() => navigate(-1)}>
          Back
        </button>
        <button
          className="booking_btn booking_btn--proceed"
          disabled={selectedSeats.length !== totalTickets || loading}
          onClick={handleProceed}
        >
          {loading ? "Holding..." : "Proceed"}
        </button>
      </div>
    </main>
  );
}
