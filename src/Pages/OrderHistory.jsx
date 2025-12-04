import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function OrderHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      // You'll need to get the current user's ID from auth context or localStorage
      const userId = localStorage.getItem('userId') || 'current-user-id';
      
      const response = await fetch(`http://localhost:4000/api/bookings/user/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    return timeString;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading your bookings...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Error: {error}</h3>
        <button onClick={fetchUserBookings}>Try Again</button>
      </div>
    );
  }

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3>No bookings yet</h3>
          <p>Start by booking your first movie!</p>
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
      ) : (
        <div>
          <div style={{ marginBottom: '20px', color: 'var(--muted)' }}>
            Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {bookings.map((booking) => {
              const showtime = booking.showtime_id || {};
              const showroom = showtime.showroom || {};
              
              return (
                <div key={booking._id} style={{
                  background: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '10px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ marginBottom: '8px' }}>
                        {showtime.movieTitle || 'Movie'}
                      </h3>
                      <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                        {showroom.name || 'Cinema'} • Screen {showroom.screenNumber || '1'}
                      </div>
                    </div>
                    
                    <div style={{
                      background: booking.status === 'confirmed' ? '#4CAF50' : '#f44336',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {booking.status || 'confirmed'}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginTop: '15px'
                  }}>
                    <div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Date & Time</div>
                      <div>
                        {formatDate(showtime.date)} at {formatTime(showtime.time)}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Seats</div>
                      <div>
                        {booking.seats?.join(', ') || 'No seats specified'}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Total</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        ${booking.total?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <Link to={`/confirmation/${booking._id}`}>
                      <button style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        color: 'var(--accent)',
                        border: '1px solid var(--accent)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}>
                        View Details
                      </button>
                    </Link>
                    
                    {booking.status === 'confirmed' && (
                      <button style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        color: '#f44336',
                        border: '1px solid #f44336',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}>
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}