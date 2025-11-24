import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./Booking.css";

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showtimeId } = useParams(); // You MUST navigate to this page using /booking/:showtimeId

  // movie info passed from previous page
  const { movieTitle = "Movie", date = "", showtime = "" } = location.state || {};

  const [seatLayout, setSeatLayout] = useState([]); // rows with seats
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);

  const ticketPrice = 12.99;

  // Helper to get current user ID
  const getUserId = () => {
    const u = localStorage.getItem("user");
    if (!u) return null;
    try { return JSON.parse(u)._id; } catch { return null; }
  };

  // Load seat map from backend
  useEffect(() => {
    if (!showtimeId) return;
    fetchSeatMap();
  }, [showtimeId]);

  async function fetchSeatMap() {
    try {
      const res = await fetch(`http://localhost:4000/api/showtimes/${showtimeId}/seats`);
      const data = await res.json();

      if (!res.ok) {
        console.error("Error fetching seat map:", data);
        return;
      }

      // Convert backend flat list to your row-based grid
      const rows = {};
      data.seats.forEach((seat) => {
        const rowLetter = seat.seatNumber[0];
        if (!rows[rowLetter]) rows[rowLetter] = { row: rowLetter, seats: [] };

        rows[rowLetter].seats.push({
          id: seat.seatNumber,
          status: seat.status,      // available / sold / held
          heldBy: seat.heldBy,
        });
      });

      // Sort rows alphabetically, seats numerically
      const finalLayout = Object.values(rows)
        .sort((a, b) => a.row.localeCompare(b.row))
        .map((rowData) => ({
          row: rowData.row,
          seats: rowData.seats.sort((a, b) => {
            const n1 = parseInt(a.id.slice(1), 10);
            const n2 = parseInt(b.id.slice(1), 10);
            return n1 - n2;
          }),
        }));

      setSeatLayout(finalLayout);

      // Deselect any seats that became unavailable
      setSelectedSeats((prev) =>
        prev.filter((seatId) => {
          const seat = data.seats.find((s) => s.seatNumber === seatId);
          return seat && seat.status === "available";
        })
      );
    } catch (err) {
      console.error(err);
    }
  }

  // Seat click logic
  const handleSeatClick = (seat) => {
    const userId = getUserId();

    if (seat.status === "sold") return;
    if (seat.status === "held" && seat.heldBy !== userId) return;

    setSelectedSeats((prev) =>
      prev.includes(seat.id)
        ? prev.filter((s) => s !== seat.id)
        : [...prev, seat.id]
    );
  };

  // Proceed -> Hold seats -> Checkout
  const handleProceed = async () => {
    if (selectedSeats.length === 0) return;
    const userId = getUserId();

    if (!userId) {
      alert("You must be logged in.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/hold-seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          showtimeId,
          seats: selectedSeats,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Unable to hold seats.");
        await fetchSeatMap();
        setLoading(false);
        return;
      }

      navigate("/checkout", {
        state: {
          holdId: data.holdId,
          seats: selectedSeats,
          showtime: { movieTitle, date, time: showtime, id: showtimeId },
          totalPrice: (selectedSeats.length * ticketPrice).toFixed(2),
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
        <section className="booking_section">
          <h2 className="booking_section-title">Choose Your Seat(s)</h2>

          <div className="booking_screen">
            <div className="booking_screen-label">SCREEN</div>
          </div>

          <div className="booking_seats-grid">
            {seatLayout.map((rowData) => (
              <div key={rowData.row} className="booking_seat-row">
                <div className="booking_row-label">{rowData.row}</div>

                <div className="booking_seats-in-row">
                  {rowData.seats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat.id);
                    const isHeldByOther =
                      seat.status === "held" &&
                      seat.heldBy &&
                      seat.heldBy !== getUserId();

                    return (
                      <button
                        key={seat.id}
                        className={`booking_seat
                          ${isSelected ? "booking_seat--selected" : ""}
                          ${seat.status === "sold" ? "booking_seat--occupied" : ""}
                          ${isHeldByOther ? "booking_seat--occupied" : ""}
                        `}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === "sold" || isHeldByOther}
                      >
                        {seat.id.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

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

            <div className="booking_legend-item">
              <div className="booking_legend-color" style={{ background: "#ffd54f" }}></div>
              <span>Held</span>
            </div>
          </div>
        </section>

        <section className="booking_order">
          <h3 className="booking_order-title">Order Summary</h3>

          <div className="booking_order-detail">
            <span className="booking_order-label">Movie</span>
            <span className="booking_order-value">{movieTitle}</span>
          </div>

          <div className="booking_order-detail">
            <span className="booking_order-label">Showtime</span>
            <span className="booking_order-value">{date}<br />{showtime}</span>
          </div>

          <div className="booking_order-detail">
            <span className="booking_order-label">Tickets</span>
            <span className="booking_order-value">{selectedSeats.length}</span>
          </div>

          <div className="booking_order-detail">
            <span className="booking_order-label">Seats</span>
            <span className="booking_seats-list">
              {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None selected"}
            </span>
          </div>

          <div className="booking_total">
            <span>TOTAL</span>
            <span>${(selectedSeats.length * ticketPrice).toFixed(2)}</span>
          </div>
        </section>
      </div>

      <div className="booking_actions">
        <button 
          className="booking_btn booking_btn--back"
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        <button 
          className="booking_btn booking_btn--proceed"
          disabled={selectedSeats.length === 0 || loading}
          onClick={handleProceed}
        >
          {loading ? "Holding..." : "Proceed to Payment"}
        </button>
      </div>
    </main>
  );
}
