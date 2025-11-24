import { useEffect, useState } from "react";
import "./ManagePromotions.css";

const PromotionItem = ({ promotion, onDelete }) => {
  const handleSendPromotion = async () => {
    if (!window.confirm("Are you sure you want to send this promotion?\nThis will send an email to every user with promotions enabled.")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/promotions/${promotion._id}`, {
        method: 'PUT'
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      else alert(data.message);
    } catch (error) {
      console.log('Failed to send promotion:', error);
    }
  }

  const handleDeletePromotion = async () => {
    if (!window.confirm("Are you sure you want to delete this promotion?\nThis cannot be undone!")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/promotions/${promotion._id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      else onDelete(promotion._id);
    } catch (error) {
      console.log('Failed to send promotion:', error);
    }
  }

  const dateString = new Date(promotion.expiration).toLocaleDateString();
  return (
    <div className="promotion-item">
      <h3 style={{margin: 0}}>{promotion.code.toUpperCase()} • {promotion.discount}% • {dateString}</h3>
      <div>
        <button
          className="send-button"
          onClick={handleSendPromotion}
        >
          Send Email
        </button>
        <button
          className="delete-button"
          onClick={handleDeletePromotion}
        >
          Delete
        </button>
    </div>
    </div>
  );
}

export default function ManagePromotions() {
  const [promotions, setPromotions] = useState([]);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [expiration, setExpiration] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/promotions");
        const promotionsData = await res.json();
        setPromotions(promotionsData);
      } catch (error) {
        console.error("Failed to fetch promotions:", error.message);
      }
    };
    fetchPromos();
  }, []);

  const handleAddPromotion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(),
          discount,
          expiration,
          message,
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      else console.log(data.message);

      setCode('');
      setDiscount('');
      setExpiration('');
      setMessage('');
      setPromotions(prev => [...prev, data.promotion]);
    } catch (err) {
      console.error("Add promotion failed:", err.message);
      alert("Add promotion failed");
    }
  };

  const handleDeletePromotion = (promoId) => {
    setPromotions(prev => prev.filter(promo => promo._id !== promoId));
    console.log("Successfully deleted promotion");
  }

  return (
    <main className="manage-promotions">
      <h2>Manage Promotions</h2>
      <form onSubmit={handleAddPromotion} className="promotion-form">
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
          placeholder="Discount %"
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
      <div className="promotion-list">
        {promotions.map(promo => (
          <PromotionItem promotion={promo} onDelete={handleDeletePromotion} key={promo._id}/>
        ))}
      </div>
    </main>
  );
}