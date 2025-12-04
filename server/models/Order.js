import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  movieTitle: {
    type: String,
    required: true
  },
  theatreName: {
    type: String,
    required: true
  },
  showtimeDate: {
    type: Date,
    required: true
  },
  showtimeTime: {
    type: String,
    required: true
  },
  seats: [{
    type: String,
    required: true
  }],
  total: {
    type: Number,
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;