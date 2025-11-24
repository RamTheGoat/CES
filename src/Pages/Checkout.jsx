import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const {
    holdId,
    showtime = {},
    seats = [],
    tickets = {},
    totalPrice: rawTotalPrice = 0,
    holdExpiresAt,
  } = state;

  const totalPrice = Number(rawTotalPrice) || 0;

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft(holdExpiresAt));
  const [processing, setProcessing] = useState(false);

  const showtimeId = showtime.id;

  useEffect(() => {
    if (!showtimeId) {
      alert("No showtime selected. Please go back and reselect seats.");
      navigate(-1);
    }
  }, [showtimeId, navigate]);

  useEffect(() => {
    const iv = setInterval(() => setTimeLeft(calcTimeLeft(holdExpiresAt)), 1000);
    return () => clearInterval(iv);
  }, [holdExpiresAt]);

  function calcTimeLeft(expiresAt) {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return diff > 0 ? Math.floor(diff / 1000) : 0;
  }

  function formatSeconds(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  const getUserId = () => {
    const u = localStorage.getItem("user");
    if (!u) return null;
    try {
      return JSON.parse(u)._id;
    } catch {
      return null;
    }
  };

  const handleConfirm = async () => {
    const userId = getUserId();
    console.log("Confirming checkout with userId:", userId);
    if (!userId || !showtimeId || !holdId) return;

    setProcessing(true);
    try {
      const res = await fetch("http://localhost:4000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, showtimeId, holdId, seats, tickets }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Checkout failed");
        setProcessing(false);
        return;
      }

      alert("Booking confirmed!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Error confirming booking.");
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (holdId) {
      try {
        await fetch(`http://localhost:4000/api/release-hold/${holdId}`, { method: "DELETE" });
      } catch (err) {
        console.error("Release error", err);
      }
    }
    navigate(-1);
  };

  return (
    <main style={{ padding: 20 }}>
      <h2>Checkout</h2>
      <div>Movie: {showtime.movieTitle || "Unknown"}</div>
      <div>
        Showtime: {showtime.date || ""} • {showtime.time || ""}
      </div>
      <div>Seats: {seats.length > 0 ? seats.join(", ") : "None selected"}</div>

      <div style={{ marginTop: 12 }}>
        <strong>Tickets:</strong>
        <div>Adult: {tickets.adult || 0}</div>
        <div>Senior: {tickets.senior || 0}</div>
        <div>Child: {tickets.child || 0}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Total: </strong>${totalPrice.toFixed(2)}
      </div>

      <div style={{ marginTop: 12 }}>
        {timeLeft > 0 ? (
          <div>
            Time left to complete purchase: <strong>{formatSeconds(timeLeft)}</strong>
          </div>
        ) : (
          <div style={{ color: "red" }}>
            Hold expired — please go back and reselect seats.
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleConfirm}
          disabled={processing || timeLeft <= 0 || !showtimeId}
        >
          {processing ? "Processing..." : "Confirm & Pay"}
        </button>
        <button onClick={handleCancel} style={{ marginLeft: 12 }}>
          Cancel
        </button>
      </div>
    </main>
  );
}
