import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { holdId, showtime = {}, seats = [], totalPrice = "0.00", holdExpiresAt } = state;

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft(holdExpiresAt));
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setTimeLeft(calcTimeLeft(holdExpiresAt)), 1000);
    return () => clearInterval(iv);
  }, [holdExpiresAt]);

  function calcTimeLeft(expiresAt) {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return diff > 0 ? Math.floor(diff / 1000) : 0;
  }

  const getUserId = () => {
    const u = localStorage.getItem("user");
    if (!u) return null;
    try { return JSON.parse(u)._id; } catch { return null; }
  };

  const handleConfirm = async () => {
    const userId = getUserId();
    if (!userId) {
      alert("You must be logged in to confirm purchase.");
      return;
    }
    if (timeLeft <= 0) {
      alert("Hold expired. Please reselect seats.");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("http://localhost:4000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, showtimeId: showtime.id || showtime._id, holdId })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Checkout failed");
        setProcessing(false);
        return;
      }
      alert("Booking confirmed!");
      navigate("/profile"); // or /my-tickets
    } catch (err) {
      console.error(err);
      alert("Error confirming booking.");
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!holdId) return navigate(-1);
    try {
      await fetch(`http://localhost:4000/api/release-hold/${holdId}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.error("Release error", err);
    } finally {
      navigate(-1);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <h2>Checkout</h2>
      <div>Movie: {showtime.movieTitle}</div>
      <div>Showtime: {showtime.date} • {showtime.time}</div>
      <div>Seats: {seats.join(", ")}</div>
      <div>Total: ${totalPrice}</div>

      <div style={{ marginTop: 12 }}>
        {timeLeft > 0 ? (
          <div>Time left to complete purchase: <strong>{formatSeconds(timeLeft)}</strong></div>
        ) : (
          <div style={{ color: "red" }}>Hold expired — please go back and reselect seats.</div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={handleConfirm} disabled={processing || timeLeft <= 0}>{processing ? "Processing..." : "Confirm & Pay"}</button>
        <button onClick={handleCancel} style={{ marginLeft: 12 }}>Cancel</button>
      </div>
    </main>
  );
}

function formatSeconds(sec) {
  const m = Math.floor(sec / 60); const s = sec % 60;
  return `${m}:${String(s).padStart(2,"0")}`;
}
