import { useEffect, useState } from "react";
import "./OrderHistory.css"; // Import your CSS

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      const userId = user._id;
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(`http://localhost:4000/api/bookings/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Server responded with ${res.status}`);

        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load your order history.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return (
    <div className="orderHistoryPage">
      <div className="loadingContainer">
        <div className="loadingSpinner"></div>
        <p>Loading your order history...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="orderHistoryPage">
      <div className="errorMessage">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="orderHistoryPage">
      <div className="orderHistoryContainer">
        <h1 className="pageTitle">Your Order History</h1>
        
        {orders.length === 0 ? (
          <div className="noOrdersMessage">
            <h3>No Bookings Found</h3>
            <p>You haven't made any bookings yet. Start by exploring our movies!</p>
          </div>
        ) : (
          <div className="ordersGrid">
            {orders.map((order) => (
              <div key={order._id} className="orderCard">
                <h2 className="movieTitle">
                  {order.showtime_id?.movieTitle || "Unknown Movie"}
                </h2>
                
                <div className="orderDetails">
                  <div className="detailRow">
                    <span className="detailLabel">Showtime:</span>
                    <span className="detailValue">
                      {order.showtime_id?.date 
                        ? `${order.showtime_id.date} at ${order.showtime_id.time}`
                        : "Unknown date/time"}
                    </span>
                  </div>
                  
                  <div className="detailRow">
                    <span className="detailLabel">Seats:</span>
                    <div className="detailValue">
                      {order.seats?.length > 0 ? (
                        <div className="seatsContainer">
                          {order.seats.map((seat, index) => (
                            <span key={index} className="seatBadge">
                              {seat}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "No seats selected"
                      )}
                    </div>
                  </div>
                  
                  <div className="detailRow">
                    <span className="detailLabel">Order Date:</span>
                    <span className="detailValue">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "Unknown"}
                    </span>
                  </div>
                  
                  {order.total > 0 && (
                    <div className="detailRow">
                      <span className="detailLabel">Total:</span>
                      <span className="totalPrice">
                        ${order.total.toFixed(2)}
                        {order.discountApplied && (
                          <span className="statusBadge statusCompleted">
                            Saved ${order.discountAmount?.toFixed(2) || '0.00'}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;