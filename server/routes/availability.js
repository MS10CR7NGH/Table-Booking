import express from 'express';
import { getDatabase } from '../config/database.js';

const router = express.Router();

// Kiểm tra tính khả dụng
router.get('/:date/:time', async (req, res) => {
  try {
    const db = getDatabase();
    const date = req.params.date;
    const time = decodeURIComponent(req.params.time);

    // Đếm đặt bàn cho ngày và giờ này
    const bookings = await db.collection('bookings').find({
      date,
      time
    }).toArray();

    // Tính tổng số khách
    const totalGuests = bookings.reduce((sum, booking) => sum + booking.guests, 0);

    // Lấy sức chứa từ settings
    const settings = await db.collection('settings').findOne({ type: 'restaurant' });
    const maxCapacity = settings?.data?.totalCapacity || 50;
    const availableSeats = Math.max(0, maxCapacity - totalGuests);

    res.json({
      available: availableSeats > 0,
      availableSeats,
      totalCapacity: maxCapacity,
      currentBookings: bookings.length
    });
  } catch (error) {
    console.error('❌ Lỗi kiểm tra tính khả dụng:', error);
    res.status(500).json({ error: 'Kiểm tra tính khả dụng thất bại' });
  }
});

export default router;

