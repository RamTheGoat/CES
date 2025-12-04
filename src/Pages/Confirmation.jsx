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
        console.log("Booking data from state:", state.booking);
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
          console.log("Booking data from localStorage:", parsed);
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
      console.log("Fetching booking with ID:", id);
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
      console.log("Booking API response:", data);
      
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
      // Fix for date being one day behind - create date in UTC
      const date = new Date(dateString + 'T00:00:00'); // Add time to prevent timezone shift
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: 'UTC' // Use UTC to prevent timezone issues
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString || "";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      // If it's in 24-hour format like "21:00"
      if (timeString.includes(":")) {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`;
      }
      
      // If it's a full datetime string
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
      <main className="confirmationPage" style={{ padding: 20 }}>
        <div className="loadingContainer" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255, 255, 255, 0.1)',
            borderTop: '3px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <h3 style={{ color: 'var(--text)' }}>Loading...</h3>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </main>
    );
  }

  if (error || !bookingDetails) {
    return (
      <main className="confirmationPage" style={{ padding: 20 }}>
        <div style={{
          textAlign: 'center',
          padding: '40px 20px'
        }}>
          <h3 style={{ color: 'var(--text)', marginBottom: '10px' }}>
            {error || "No booking found"}
          </h3>
          <Link to="/">
            <button style={{
              padding: '12px 24px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '20px'
            }}>
              Browse Movies
            </button>
          </Link>
        </div>
      </main>
    );
  }

  console.log("Booking details for rendering:", bookingDetails);

  // Extract data based on YOUR actual API response structure
  const {
    bookingId,
    total = 0,
    discountApplied = false,
    showtime = {},
    seats = [],
    tickets = {},
    status = 'confirmed',
    user = {},
    movieTitle,
    theatreName,
    screenNumber
  } = bookingDetails;

  // Get cinema/theatre name - check multiple possible sources
  // Check the showtime object first, then bookingDetails directly
  const finalMovieTitle = showtime?.movieTitle || movieTitle || bookingDetails.movieTitle || "Movie";
  
  // Try to get theatre info from various possible locations in your data structure
  let finalTheatreName = "Cinema";
  let finalScreenNumber = "1";
  
  // Check all possible locations for theatre data
  if (showtime?.theatre?.name) {
    finalTheatreName = showtime.theatre.name;
  } else if (showtime?.theatreName) {
    finalTheatreName = showtime.theatreName;
  } else if (theatreName) {
    finalTheatreName = theatreName;
  } else if (showtime?.theatre) {
    finalTheatreName = showtime.theatre;
  } else if (bookingDetails.theatreName) {
    finalTheatreName = bookingDetails.theatreName;
  } else if (bookingDetails.theatre?.name) {
    finalTheatreName = bookingDetails.theatre.name;
  }
  
  // Check all possible locations for screen number
  if (showtime?.screenNumber) {
    finalScreenNumber = showtime.screenNumber;
  } else if (screenNumber) {
    finalScreenNumber = screenNumber;
  } else if (showtime?.screen) {
    finalScreenNumber = showtime.screen;
  } else if (bookingDetails.screenNumber) {
    finalScreenNumber = bookingDetails.screenNumber;
  } else if (showtime?.theatre?.screenNumber) {
    finalScreenNumber = showtime.theatre.screenNumber;
  }
  
  // Get date and time
  const finalShowtimeDate = showtime?.date;
  const finalShowtimeTime = showtime?.time;
  
  // Get user info
  const userName = user?.name || user?.username || "Customer";
  const userFirstName = userName.split(" ")[0];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'cancelled':
        return '#f44336';
      case 'refunded':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  // Calculate ticket totals
  let ticketCount = 0;
  let ticketDetails = [];
  
  if (tickets && typeof tickets === 'object') {
    ticketCount = Object.values(tickets).reduce((sum, count) => sum + (count || 0), 0);
    
    // Create ticket details for display
    if (tickets.adult > 0) ticketDetails.push({ type: 'Adult', count: tickets.adult, price: 12 });
    if (tickets.senior > 0) ticketDetails.push({ type: 'Senior', count: tickets.senior, price: 10 });
    if (tickets.child > 0) ticketDetails.push({ type: 'Child', count: tickets.child, price: 8 });
  }

  return (
    <main className="confirmationPage" style={{ 
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* Simple Header with User's Name */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: getStatusColor(status),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 15px',
          fontSize: '30px',
          color: 'white'
        }}>
          {status === 'confirmed' ? '✓' : status === 'cancelled' ? '✗' : '↺'}
        </div>
        <h2 style={{ 
          marginBottom: '5px',
          color: 'var(--text)',
          fontSize: '1.5rem'
        }}>
          {status === 'confirmed' ? 'Booking Complete!' : 
           status === 'cancelled' ? 'Booking Cancelled' : 
           'Booking Refunded'}
        </h2>
        <p style={{
          color: 'var(--muted)',
          fontSize: '1rem',
          marginBottom: '10px'
        }}>
          Thank you, {userFirstName}!
        </p>
        <p style={{
          color: 'var(--muted)',
          fontSize: '0.9rem'
        }}>
          {status === 'confirmed' 
            ? 'Your tickets are reserved.'
            : 'This booking has been ' + status + '.'}
        </p>
        {bookingId && (
          <p style={{
            color: 'var(--muted)',
            fontSize: '0.8rem',
            marginTop: '10px',
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.2)',
            padding: '5px 10px',
            borderRadius: '4px',
            display: 'inline-block'
          }}>
            ID: {bookingId}
          </p>
        )}
      </div>

      {/* Movie Details Card */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{
          marginBottom: '15px',
          color: 'var(--text)',
          fontSize: '1.3rem',
          textAlign: 'center'
        }}>
          {finalMovieTitle}
        </h3>
        
        {/* Showtime Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Cinema</div>
            <div style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: '500' }}>
              {finalTheatreName}
            </div>
          </div>
          
          <div>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Screen</div>
            <div style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: '500' }}>
              {finalScreenNumber}
            </div>
          </div>
          
          <div>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Date</div>
            <div style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: '500' }}>
              {formatDate(finalShowtimeDate) || "Date not specified"}
            </div>
          </div>
          
          <div>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Time</div>
            <div style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: '500' }}>
              {formatTime(finalShowtimeTime) || "Time not specified"}
            </div>
          </div>
        </div>

        {/* Seats - only show if we have seat data */}
        {seats && Array.isArray(seats) && seats.length > 0 && (
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px'
          }}>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
              Seats ({seats.length})
            </div>
            <div style={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center'
            }}>
              {seats.map((seat, index) => (
                <div key={index} style={{
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {seat}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ticket Summary - only show if we have ticket data */}
        {ticketDetails.length > 0 && (
          <div style={{
            padding: '15px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              color: 'var(--muted)', 
              fontSize: '0.9rem', 
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              Tickets ({ticketCount})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ticketDetails.map((ticket, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{ticket.type} × {ticket.count}</span>
                  <span>${(ticket.count * ticket.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '15px',
          borderTop: `2px solid ${getStatusColor(status)}`
        }}>
          <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Total</span>
          <span style={{ 
            fontSize: '1.3rem', 
            fontWeight: 'bold',
            color: getStatusColor(status)
          }}>
            ${total.toFixed(2)}
          </span>
        </div>
        
        {discountApplied && (
          <div style={{
            marginTop: '10px',
            padding: '8px',
            background: 'rgba(76, 175, 80, 0.1)',
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#4CAF50'
          }}>
            Discount applied to this booking
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center'
      }}>
        <Link to="/" style={{ textDecoration: 'none', flex: 1 }}>
          <button
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            Back to Home
          </button>
        </Link>
        
        <button
          onClick={() => window.print()}
          style={{
            padding: '12px 20px',
            background: 'transparent',
            color: 'var(--text)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Print
        </button>
      </div>

      {/* Debug Info - will help us see what data we're actually getting */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          background: 'rgba(255, 0, 0, 0.1)',
          borderRadius: '6px',
          fontSize: '0.8rem',
          color: 'var(--muted)',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <div><strong>Debug Info:</strong></div>
          <div>Booking ID: {bookingId}</div>
          <div>Movie: {finalMovieTitle}</div>
          <div>Cinema: {finalTheatreName}</div>
          <div>Screen: {finalScreenNumber}</div>
          <div>Raw Date: {finalShowtimeDate}</div>
          <div>Formatted Date: {formatDate(finalShowtimeDate)}</div>
          <div>Raw Time: {finalShowtimeTime}</div>
          <div>Formatted Time: {formatTime(finalShowtimeTime)}</div>
          <div>User: {userName}</div>
          <div>Status: {status}</div>
          <div>Total: ${total}</div>
          <div>Seats: {JSON.stringify(seats)}</div>
          <div>Tickets: {JSON.stringify(tickets)}</div>
          <div>Showtime Object: {JSON.stringify(showtime).substring(0, 100)}...</div>
        </div>
      )}
    </main>
  );
}