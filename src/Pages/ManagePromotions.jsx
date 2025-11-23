import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./ManagePromotions.css";

export default function ManagePromotions() {
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [expiration, setExpiration] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discount,
          expiration,
          message,
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      else console.log(data.message);
    } catch (err) {
      console.error("Send promotion failed:", err.message);
    }
  };

  return (
    <div className="send-promotion">
      <h2>Manage Promotions</h2>
      <form onSubmit={handleSend} className="promotion-form">
        <input
          type="text"
          placeholder="Promo Code"
          value={code}
          onChange={e => setCode(e.target.value)}
          style={{gridColumn: "1 / span 4"}}
          className="promotion-form-input"
          required
        />
        <input
          type="number"
          placeholder="Discount Percent"
          value={discount}
          onChange={e => setDiscount(e.target.value)}
          style={{gridColumn: "1 / span 2"}}
          className="promotion-form-input"
          required
        />
        <input
          type="date"
          value={expiration}
          placeholder="Expiration Date"
          onChange={e => setExpiration(e.target.value)}
          onKeyDown={e => e.preventDefault()}
          style={{gridColumn: "3 / span 2"}}
          className="promotion-form-input date-input"
          required
        />
        <textarea
          placeholder="Promotion Message"
          value={message}
          rows={5}
          maxLength={300}
          onChange={e => setMessage(e.target.value)}
          style={{gridColumn: "1 / span 4"}}
          className="promotion-form-input"
          required
        />
        <button
          type="submit"
          className="promotion-form-submit"
          style={{gridColumn: "2 / span 2"}}
        >
          Add Promotion
        </button>
      </form>
    </div>
  );
}