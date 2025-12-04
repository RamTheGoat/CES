import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import "./Confirmation.css";

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId: urlBookingId } = useParams();
  
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      const state = location.state || {};
      
      // Priority 1: If bookingId is in URL params
      if (urlBookingId) {
        await fetchBookingById(urlBookingId);
        return;
      }
      
      // Priority 2: If booking data is passed from checkout
      if (state.booking) {
        setBookingDetails(state.booking);
        setLoading(false);
        return;
      }
      
      // Priority 3: If just the bookingId is in state
      if (state.bookingId) {
        await fetchBookingById(state.bookingId);
        return;
      }
      
      // Priority 4: Check localStorage for recent booking
      const savedBooking = localStorage.getItem("lastBooking");
      if (savedBooking) {
        try {
          const parsed = JSON.parse(savedBooking);
          setBookingDetails(parsed);
        } catch (err) {
          console.error("Error parsing saved booking:", err);
        }
      }
      
      setLoading(false);
      
      // Clean up localStorage after displaying
      const timer = setTimeout(() => {
        localStorage.removeItem("lastBooking");
      }, 5000);
      
      return () => clearTimeout(timer);
    };

    fetchBookingDetails();
  }, [location, urlBookingId]);

  const fetchBookingById = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:4000/api/bookings/${id}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Booking not found.");
        } else {
          setError("Failed to load booking details.");
        }
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      // Check if your API returns the booking inside a 'booking' property or directly
      if (data.booking) {
        setBookingDetails(data.booking);
      } else {
        setBookingDetails(data);
      }
      
      setError("");
    } catch (err) {
      console.error("Error fetching booking:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: 'UTC'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString || "";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      if (timeString.includes(":")) {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`;
      }
      
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error("Error formatting time:", e);
      return timeString || "";
    }
  };

  if (loading) {
    return (
      <main className="confirmationPage">
        <div className="loadingContainer">
          <div className="loadingSpinner"></div>
          <h3>Loading your booking details...</h3>
        </div>
      </main>
    );
  }

  if (error || !bookingDetails) {
    return (
      <main className="confirmationPage">
        <div className="errorContainer">
          <h3 className="errorTitle">
            {error || "No booking found"}
          </h3>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
            We couldn't find your booking details.
          </p>
          <Link to="/" className="primaryButton" style={{ display: 'inline-block' }}>
            Browse Movies
          </Link>
        </div>
      </main>
    );
  }

  // Extract data
  const {
    bookingId,
    total = 0,
    discountApplied = false,
    showtime = {},
    seats = [],
    tickets = {},
    status = 'confirmed'
  } = bookingDetails;

  // Get movie title
  const showtimeData = bookingDetails.showtime || showtime || {};
  const finalMovieTitle = showtimeData.movieTitle || bookingDetails.movieTitle || "Movie";
  
  // Get user info
  const user = bookingDetails.user || {};
  const userName = user?.name || user?.username || "Customer";
  const userFirstName = userName.split(" ")[0];

  // Calculate ticket totals
  let ticketCount = 0;
  let ticketDetails = [];
  
  if (tickets && typeof tickets === 'object') {
    ticketCount = Object.values(tickets).reduce((sum, count) => sum + (count || 0), 0);
    
    if (tickets.adult > 0) ticketDetails.push({ type: 'Adult', count: tickets.adult, price: 12 });
    if (tickets.senior > 0) ticketDetails.push({ type: 'Senior', count: tickets.senior, price: 10 });
    if (tickets.child > 0) ticketDetails.push({ type: 'Child', count: tickets.child, price: 8 });
  }

  const statusClass = status === 'confirmed' ? '' : 
                     status === 'cancelled' ? 'statusCancelled' : 'statusRefunded';

  return (
    <main className="confirmationPage">
      <div className="confirmationContainer">
        {/* Header */}
        <div className={`confirmationHeader ${statusClass}`}>
          <div className="statusIcon">
            {status === 'confirmed' ? '✓' : status === 'cancelled' ? '✗' : '↺'}
          </div>
          <h1 className="confirmationTitle">
            {status === 'confirmed' ? 'Booking Complete!' : 
             status === 'cancelled' ? 'Booking Cancelled' : 
             'Booking Refunded'}
          </h1>
          <p className="confirmationSubtitle">
            Thank you, {userFirstName}! Your {status === 'confirmed' ? 'tickets are reserved.' : 'booking has been ' + status + '.'}
          </p>
          {bookingId && (
            <div className="confirmationId">ID: {bookingId}</div>
          )}
        </div>

        {/* Movie Details Card */}
        <div className="movieCard">
          <h2 className="movieTitle">{finalMovieTitle}</h2>
          
          {/* Showtime Info - Removed Cinema and Screen */}
          <div className="showtimeGrid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="showtimeItem">
              <span className="showtimeLabel">Date</span>
              <span className="showtimeValue">
                {formatDate(showtimeData.date) || "Date not specified"}
              </span>
            </div>
            
            <div className="showtimeItem">
              <span className="showtimeLabel">Time</span>
              <span className="showtimeValue">
                {formatTime(showtimeData.time) || "Time not specified"}
              </span>
            </div>
          </div>

          {/* Seats */}
          {seats && Array.isArray(seats) && seats.length > 0 && (
            <div className="seatsSection">
              <div className="sectionTitle">Seats ({seats.length})</div>
              <div className="seatsContainer">
                {seats.map((seat, index) => (
                  <span key={index} className="seatBadge">{seat}</span>
                ))}
              </div>
            </div>
          )}

          {/* Ticket Summary */}
          {ticketDetails.length > 0 && (
            <div className="ticketsSection">
              <div className="sectionTitle" style={{ textAlign: 'center' }}>
                Tickets ({ticketCount})
              </div>
              <div style={{ marginTop: '0.8rem' }}>
                {ticketDetails.map((ticket, index) => (
                  <div key={index} className="ticketRow">
                    <span>{ticket.type} × {ticket.count}</span>
                    <span>${(ticket.count * ticket.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="totalSection">
            <span className="totalLabel">Total</span>
            <span className="totalAmount">${total.toFixed(2)}</span>
          </div>
          
          {discountApplied && (
            <div className="discountBadge">
              Discount applied to this booking
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="actionButtons">
          <Link to="/" className="primaryButton">
            Back to Home
          </Link>
          
          <button
            onClick={() => window.print()}
            className="secondaryButton"
          >
            Print Tickets
          </button>
        </div>
      </div>
    </main>
  );
}