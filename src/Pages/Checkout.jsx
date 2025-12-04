import React, { useEffect, useState } from "react";
import { useLocation, useNavigate} from "react-router-dom";
import "./Checkout.css";

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

  // Payment State
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [useSavedCard, setUseSavedCard] = useState(true);
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardError, setCardError] = useState(null);
  const [loadingCard, setLoadingCard] = useState(true);

  // Promotion State
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(totalPrice);

  // Redirect if missing showtime
  useEffect(() => {
    if (!showtimeId) {
      alert("No showtime selected. Please go back and reselect seats.");
      navigate(-1);
    }
  }, [showtimeId, navigate]);

  // Timer
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

  // Fetch saved card on mount
  useEffect(() => {
    async function loadSavedCards() {  // Renamed to loadSavedCards
      const userId = getUserId();
      console.log("Loading cards for user ID:", userId);
      if (!userId) {
        setLoadingCard(false);
        return;
      }
      
      try {
        const res = await fetch(`http://localhost:4000/api/users/${userId}/cards`);
        console.log("Cards fetch response status:", res.status);
        
        if (!res.ok) {
          console.log("No cards found or error:", res.status);
          setSavedCards([]);  // Set empty array
          setSelectedCardId(null);
          setLoadingCard(false);
          return;
        }
        
        const data = await res.json();
        console.log("Cards fetch data:", data);
        
        if (data && data.cards && data.cards.length > 0) {
          console.log("Setting saved cards:", data.cards);
          setSavedCards(data.cards);  // Set ALL cards
          // Auto-select first card if available
          setSelectedCardId(data.cards[0]._id);
          setUseSavedCard(true);
        } else {
          console.log("No cards found for user");
          setSavedCards([]);  // Set empty array
          setSelectedCardId(null);
          setUseSavedCard(false);
        }
      } catch (err) {
        console.error("Failed to load saved cards", err);
        setSavedCards([]);  // Set empty array
        setSelectedCardId(null);
        setUseSavedCard(false);
      } finally {
        setLoadingCard(false);
      }
    }
    
    loadSavedCards();
  }, []);

  // --- Validation function
  function validateCardFields() {
    setCardError(null);
    const num = (cardNumber || "").replace(/\s+/g, "");
    if (!num || num.length < 12) {
      setCardError("Card number looks too short");
      return false;
    }
    const mm = Number(expMonth);
    const yy = Number(expYear);
    if (!mm || mm < 1 || mm > 12) {
      setCardError("Invalid expiration month");
      return false;
    }
    const currentYear = new Date().getFullYear();
    if (!yy || yy < currentYear) {
      setCardError("Card appears expired");
      return false;
    }
    if (yy === currentYear && mm < new Date().getMonth() + 1) {
      setCardError("Card appears expired");
      return false;
    }
    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      setCardError("Invalid CVV");
      return false;
    }
    return true;
  }

  const handleConfirm = async () => {
    const userId = getUserId();
    console.log("Confirming checkout with userId:", userId);
    if (!userId || !showtimeId || !holdId) return;
  
    // Check if using saved card
    const usingSavedCard = useSavedCard && selectedCardId;
    
    if (!usingSavedCard) {
      // Validate new card fields if not using saved card
      const ok = validateCardFields();
      if (!ok) return;
    }
  
    // Prepare payment payload
    const paymentPayload = usingSavedCard
      ? { savedCardId: selectedCardId }
      : {
          card: {
            cardType: "Visa",
            cardNumber: (cardNumber || "").replace(/\s+/g, ""),
            expMonth: Number(expMonth),
            expYear: Number(expYear),
            cvv: cvv,
          }
        };
  
    setProcessing(true);
    try {
      const res = await fetch("http://localhost:4000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          showtimeId, 
          holdId, 
          seats, 
          tickets, 
          payment: paymentPayload,
          promoCode: appliedPromo ? appliedPromo.code : null 
        }),
      });
  
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Checkout failed");
        setProcessing(false);
        return;
      }
  
      // Save booking data to localStorage for backup
      const bookingData = {
        ...data,
        showtime,
        seats,
        tickets,
        totalPrice: data.total,
        discountAmount: discountAmount,
        finalPrice: data.total,
        movieTitle: data.movieTitle || showtime.movieTitle,
        theatreName: data.theatreName || showtime.theatreName,
        screenNumber: showtime.screenNumber,
        bookingDate: new Date().toISOString()
      };
      
      localStorage.setItem("lastBooking", JSON.stringify(bookingData));
  
      // Navigate to confirmation page with booking data
      navigate("/confirmation", {
        state: {
          ...bookingData,
          confirmationNumber: data.confirmationNumber || data.booking?.confirmationNumber,
          bookingId: data.booking?._id
        }
      });
      
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

  // Promotion Code - Update final price when discount or total changes
  useEffect(() => {
    const discountedPrice = totalPrice - discountAmount;
    setFinalPrice(discountedPrice > 0 ? discountedPrice : 0);
  }, [totalPrice, discountAmount]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setPromoError("");
    try {
      console.log("Applying promo code:", promoCode);
      const response = await fetch(`http://localhost:4000/api/promotions/validate/${promoCode}`);
      
      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      if (!response.ok) {
        try {
          const error = JSON.parse(responseText);
          setPromoError(error.message || "Invalid promo code");
        } catch {
          setPromoError("Invalid promo code");
        }
        return;
      }

      const data = JSON.parse(responseText);
      console.log("Promo data received:", data);
      
      const promotion = data.promotion || data;
      console.log("Promotion object:", promotion);
      
      if (!promotion) {
        setPromoError("Invalid promotion data received");
        return;
      }
      
      console.log("Promotion properties:", {
        code: promotion.code,
        discount: promotion.discount,
        expiration: promotion.expiration,
        message: promotion.message
      });
      
      const now = new Date();
      const expirationDate = new Date(promotion.expiration);
      
      if (isNaN(expirationDate.getTime())) {
        setPromoError("Invalid expiration date for promotion");
        return;
      }
      
      if (now > expirationDate) {
        setPromoError("This promotion has expired");
        return;
      }
      
      let discount = 0;
      console.log("Calculating discount...");
      console.log("Discount value:", promotion.discount);
      console.log("Total price:", totalPrice);
      
      discount = totalPrice * (promotion.discount / 100);
      console.log("Percentage discount calculated:", discount);
      
      if (discount > totalPrice) {
        discount = totalPrice;
      }
      
      console.log("Final discount amount:", discount);
      
      const mappedPromotion = {
        code: promotion.code,
        description: promotion.message || "Promotion discount",
        discount: promotion.discount,
        expiration: promotion.expiration
      };
      
      setAppliedPromo(mappedPromotion);
      setDiscountAmount(discount);
      setPromoError("");
      
      alert(`Promo code applied! You saved $${discount.toFixed(2)}`);
      
    } catch (err) {
      console.error("Error applying promo:", err);
      setPromoError("Error applying promo code. Please try again.");
    }
  };
  
  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoCode("");
    setPromoError("");
  };

  console.log("Current state - savedCard:", savedCards, "useSavedCard:", useSavedCard, "loadingCard:", loadingCard);

  return (
    <main className="checkoutPage" style={{ padding: 20 }}>
      <div className="checkoutSummary">
        <div className="movieTitle"> {showtime.movieTitle || "Unknown"} </div>
        <div className="showtimeInfo">
          {showtime.date || ""} | {showtime.time || ""}
        </div>

        <h2 className="OrderTitle">Order Details</h2>

        <div className="ticketTypes" style={{ marginTop: 12 }}>
          <strong>TICKETS</strong>
          <div>Adult: {tickets.adult || 0}</div>
          <div>Senior: {tickets.senior || 0}</div>
          <div>Child: {tickets.child || 0}</div>
        </div>

        <div className="seats">Seats {seats.length > 0 ? seats.join(", ") : "None selected"}</div>

        <div className="ticketTimer" style={{ marginTop: 12 }}>
          {timeLeft > 0 ? (
            <div className="timeLeft">
              Time left to complete purchase: <strong>{formatSeconds(timeLeft)}</strong>
            </div>
          ) : (
            <div style={{ color: "red" }}>
              Hold expired — please go back and reselect seats.
            </div>
          )}
        </div>

        {/* PROMOTION CODE SECTION */}
        <div className="promoSection" style={{ marginTop: 16 }}>
          <h4 style={{ marginBottom: 8, color: 'var(--text)' }}>Promo Code</h4>
          
          {appliedPromo ? (
            <div className="appliedPromo" style={{
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid #4CAF50',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#4CAF50' }}>Promo Applied: {appliedPromo.code}</strong>
                  <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    {appliedPromo.description || appliedPromo.message || "Promotion discount"}
                  </div>
                </div>
                <button
                  onClick={handleRemovePromo}
                  style={{
                    background: 'transparent',
                    border: '1px solid #4CAF50',
                    color: '#4CAF50',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
              <div style={{ marginTop: '8px', color: '#4CAF50' }}>
                -${discountAmount.toFixed(2)} discount applied
              </div>
            </div>
          ) : (
            <div className="promoInput" style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                style={{
                  flex: 1,
                  padding: '10px',
                  border: `1px solid ${promoError ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                  background: 'rgba(0, 0, 0, 0.3)',
                  color: 'var(--text)',
                  borderRadius: '4px'
                }}
              />
              <button
                onClick={handleApplyPromo}
                disabled={!promoCode.trim()}
                style={{
                  padding: '10px 20px',
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: promoCode.trim() ? 'pointer' : 'not-allowed',
                  opacity: promoCode.trim() ? 1 : 0.6
                }}
              >
                Apply
              </button>
            </div>
          )}
          
          {promoError && (
            <div style={{ color: '#ff6b6b', marginTop: '8px', fontSize: '0.9rem' }}>
              {promoError}
            </div>
          )}
        </div>

        <div className="totalSection" style={{ 
          marginTop: 20, 
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ marginBottom: 16, color: 'var(--text)' }}>Order Summary</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Subtotal:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Discount:</span>
                <span style={{ color: '#4CAF50' }}>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '8px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}>
              <span style={{ color: 'var(--text)' }}>Total:</span>
              <span style={{ color: 'var(--accent)' }}>
                ${finalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* PAYMENT SECTION */}
        <div className="paymentSection" style={{ marginTop: 24 }}>
          <h3 style={{ 
            marginBottom: 20, 
            color: 'var(--text)', 
            fontSize: '1.4rem',
            fontWeight: '600'
          }}>Payment Method</h3>

          {loadingCard ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px'
            }}>
              <div style={{ color: 'var(--muted)' }}>Loading payment options...</div>
            </div>
          ) : savedCards.length > 0 ? (
            <div className="savedCardsBlock">
              {/* Option to use saved cards */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 16,
                  gap: '8px'
                }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '12px',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: 'white'
                  }}>1</div>
                  <h4 style={{ 
                    margin: 0, 
                    color: 'var(--text)', 
                    fontSize: '1.1rem',
                    fontWeight: '500'
                  }}>Select Saved Card</h4>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  {savedCards.map(card => (
                    <div 
                      key={card._id} 
                      onClick={() => {
                        setSelectedCardId(card._id);
                        setUseSavedCard(true);
                      }}
                      style={{
                        padding: '16px',
                        border: `2px solid ${useSavedCard && selectedCardId === card._id ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)'}`,
                        borderRadius: '10px',
                        background: useSavedCard && selectedCardId === card._id 
                          ? 'rgba(var(--accent-rgb), 0.1)' 
                          : 'rgba(255, 255, 255, 0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        position: 'relative'
                      }}
                    >
                      {/* Radio indicator */}
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `2px solid ${useSavedCard && selectedCardId === card._id ? 'var(--accent)' : 'rgba(255, 255, 255, 0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {useSavedCard && selectedCardId === card._id && (
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: 'var(--accent)'
                          }}></div>
                        )}
                      </div>
                      
                      {/* Card icon based on type */}
                      <div style={{
                        width: '40px',
                        height: '28px',
                        borderRadius: '4px',
                        background: card.cardType === 'Visa' 
                          ? 'linear-gradient(45deg, #1a1f71, #f7b600)'
                          : card.cardType === 'Mastercard'
                          ? 'linear-gradient(45deg, #eb001b, #f79e1b)'
                          : card.cardType === 'American Express'
                          ? 'linear-gradient(45deg, #2e77bc, #6ac4f1)'
                          : 'linear-gradient(45deg, #333, #666)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {card.cardType?.charAt(0) || 'C'}
                      </div>
                      
                      {/* Card details */}
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '4px'
                        }}>
                          <div style={{ 
                            fontWeight: '500', 
                            color: 'var(--text)',
                            fontSize: '1rem'
                          }}>
                            {card.cardType || 'Credit Card'}
                          </div>
                          <div style={{ 
                            fontWeight: '600', 
                            color: 'var(--text)',
                            fontSize: '1rem',
                            letterSpacing: '1px'
                          }}>
                            •••• {card.lastFour}
                          </div>
                        </div>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: 'var(--muted)',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <div>Expires</div>
                          <div>
                            {String(card.expirationMonth).padStart(2, '0')}/{String(card.expirationYear).slice(-2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  margin: '24px 0',
                  gap: '12px'
                }}>
                  <div style={{ 
                    flex: 1, 
                    height: '1px', 
                    background: 'rgba(255, 255, 255, 0.1)' 
                  }}></div>
                  <div style={{ 
                    color: 'var(--muted)', 
                    fontSize: '0.9rem' 
                  }}>or</div>
                  <div style={{ 
                    flex: 1, 
                    height: '1px', 
                    background: 'rgba(255, 255, 255, 0.1)' 
                  }}></div>
                </div>

                {/* Option to use new card */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: 16,
                    gap: '8px'
                  }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '12px',
                      background: !useSavedCard ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: !useSavedCard ? 'white' : 'var(--muted)'
                    }}>2</div>
                    <h4 style={{ 
                      margin: 0, 
                      color: !useSavedCard ? 'var(--text)' : 'var(--muted)', 
                      fontSize: '1.1rem',
                      fontWeight: '500'
                    }}>Use New Card</h4>
                  </div>
                  
                  <div 
                    onClick={() => setUseSavedCard(false)}
                    style={{
                      padding: '16px',
                      border: `2px solid ${!useSavedCard ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '10px',
                      background: !useSavedCard 
                        ? 'rgba(var(--accent-rgb), 0.1)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${!useSavedCard ? 'var(--accent)' : 'rgba(255, 255, 255, 0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {!useSavedCard && (
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: 'var(--accent)'
                        }}></div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '500', 
                        color: !useSavedCard ? 'var(--text)' : 'var(--muted)',
                        fontSize: '1rem'
                      }}>
                        Enter new credit card details
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* New card form - only show if not using saved card */}
              {!useSavedCard && (
                <div className="newCardForm" style={{ 
                  marginTop: 24,
                  padding: '24px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <h4 style={{ 
                    marginBottom: 20, 
                    color: 'var(--text)', 
                    fontSize: '1.1rem',
                    fontWeight: '500'
                  }}>Card Details</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        color: 'var(--text)',
                        fontSize: '0.95rem',
                        fontWeight: '500'
                      }}>
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        style={{
                          width: '100%',
                          padding: '14px',
                          border: `1px solid ${cardError && cardError.includes('number') ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                          background: 'rgba(0, 0, 0, 0.3)',
                          color: 'var(--text)',
                          borderRadius: '8px',
                          fontSize: '16px',
                          transition: 'border 0.2s ease'
                        }}
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px',
                          color: 'var(--text)',
                          fontSize: '0.95rem',
                          fontWeight: '500'
                        }}>
                          Expiry Month
                        </label>
                        <select
                          value={expMonth}
                          onChange={(e) => setExpMonth(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '14px',
                            border: `1px solid ${cardError && cardError.includes('month') ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                            background: 'rgba(0, 0, 0, 0.3)',
                            color: 'var(--text)',
                            borderRadius: '8px',
                            fontSize: '16px'
                          }}
                        >
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px',
                          color: 'var(--text)',
                          fontSize: '0.95rem',
                          fontWeight: '500'
                        }}>
                          Expiry Year
                        </label>
                        <select
                          value={expYear}
                          onChange={(e) => setExpYear(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '14px',
                            border: `1px solid ${cardError && cardError.includes('year') ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                            background: 'rgba(0, 0, 0, 0.3)',
                            color: 'var(--text)',
                            borderRadius: '8px',
                            fontSize: '16px'
                          }}
                        >
                          <option value="">YYYY</option>
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ maxWidth: '200px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        color: 'var(--text)',
                        fontSize: '0.95rem',
                        fontWeight: '500'
                      }}>
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        style={{
                          width: '100%',
                          padding: '14px',
                          border: `1px solid ${cardError && cardError.includes('CVV') ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                          background: 'rgba(0, 0, 0, 0.3)',
                          color: 'var(--text)',
                          borderRadius: '8px',
                          fontSize: '16px'
                        }}
                      />
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--muted)',
                        marginTop: '4px'
                      }}>
                        3 or 4 digits on back of card
                      </div>
                    </div>
                  </div>
                  
                  {cardError && (
                    <div style={{ 
                      color: '#ff6b6b', 
                      marginTop: '16px', 
                      padding: '12px',
                      background: 'rgba(255, 107, 107, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                      fontSize: '0.95rem'
                    }}>
                      ⚠️ {cardError}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              padding: '24px',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: 20,
                gap: '12px'
              }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '12px',
                  background: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: 'white'
                }}>1</div>
                <h4 style={{ 
                  margin: 0, 
                  color: 'var(--text)', 
                  fontSize: '1.1rem',
                  fontWeight: '500'
                }}>Enter Card Details</h4>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    color: 'var(--text)',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: `1px solid ${cardError && cardError.includes('number') ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: 'var(--text)',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px',
                      color: 'var(--text)',
                      fontSize: '0.95rem',
                      fontWeight: '500'
                    }}>
                      Expiry Month
                    </label>
                    <select
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px',
                        border: `1px solid ${cardError && cardError.includes('month') ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: 'var(--text)',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px',
                      color: 'var(--text)',
                      fontSize: '0.95rem',
                      fontWeight: '500'
                    }}>
                      Expiry Year
                    </label>
                    <select
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px',
                        border: `1px solid ${cardError && cardError.includes('year') ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: 'var(--text)',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                
                <div style={{ maxWidth: '200px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    color: 'var(--text)',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: `1px solid ${cardError && cardError.includes('CVV') ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'}`,
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: 'var(--text)',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--muted)',
                    marginTop: '4px'
                  }}>
                    3 or 4 digits on back of card
                  </div>
                </div>
              </div>
              
              {cardError && (
                <div style={{ 
                  color: '#ff6b6b', 
                  marginTop: '16px', 
                  padding: '12px',
                  background: 'rgba(255, 107, 107, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                  fontSize: '0.95rem'
                }}>
                  ⚠️ {cardError}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="decisionButtons" style={{ marginTop: 24, display: 'flex', gap: '12px' }}>
          <button
            onClick={handleConfirm}
            disabled={processing || timeLeft <= 0 || !showtimeId || loadingCard}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {processing ? "Processing..." : `Confirm & Pay $${finalPrice.toFixed(2)}`}
          </button>
          <button 
            onClick={handleCancel}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: 'var(--text)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}