import express from 'express';
import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';
import { sendBookingConfirmationEmail } from '../services/emailService.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Tạo đặt bàn mới
router.post('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { name, email, phone, date, time, guests, diningPreference, tableId, tableNumber, note } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !date || !time || !guests) {
      return res.status(400).json({ error: 'Thiếu các trường bắt buộc' });
    }

    const booking = {
      name,
      email,
      phone,
      date,
      time,
      guests: parseInt(guests),
      diningPreference: diningPreference || 'indoor',
      tableId: tableId || null,
      tableNumber: tableNumber || null,
      status: 'confirmed',
      note: note ? String(note).slice(0, 500) : '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('bookings').insertOne(booking);
    booking._id = result.insertedId;
    booking.id = result.insertedId.toString();

    console.log(`✅ Đã tạo đặt bàn: ${booking.id} cho ${email}`);

    // Gửi email xác nhận (không chặn response nếu lỗi)
    sendBookingConfirmationEmail({
      ...booking,
      bookingId: booking.id,
    }).catch((err) => console.error('❌ Gửi email thất bại:', err.message));

    res.json({
      success: true,
      bookingId: booking.id,
      message: 'Đặt bàn thành công'
    });
  } catch (error) {
    console.error('❌ Lỗi tạo đặt bàn:', error);
    res.status(500).json({ error: 'Tạo đặt bàn thất bại' });
  }
});

// Lấy tất cả đặt bàn
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const bookings = await db.collection('bookings')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Convert _id to id for frontend compatibility
    const formattedBookings = bookings.map(booking => ({
      id: booking._id.toString(),
      ...booking,
      _id: undefined
    }));

    res.json({ bookings: formattedBookings });
  } catch (error) {
    console.error('❌ Lỗi lấy đặt bàn:', error);
    res.status(500).json({ error: 'Lấy đặt bàn thất bại' });
  }
});

// Lấy đặt bàn theo ngày
router.get('/date/:date', verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const date = req.params.date;

    const bookings = await db.collection('bookings')
      .find({ date })
      .sort({ time: 1 })
      .toArray();

    const formattedBookings = bookings.map(booking => ({
      id: booking._id.toString(),
      ...booking,
      _id: undefined
    }));

    res.json({ bookings: formattedBookings });
  } catch (error) {
    console.error('❌ Lỗi lấy đặt bàn theo ngày:', error);
    res.status(500).json({ error: 'Lấy đặt bàn thất bại' });
  }
});

// Phân bàn cho đặt bàn
router.put('/:id/assign-table', verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const bookingId = req.params.id;
    const { tableId, tableNumber } = req.body;

    if (!tableId || !tableNumber) {
      return res.status(400).json({ error: 'Thiếu thông tin bàn' });
    }

    const result = await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          tableId,
          tableNumber,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đặt bàn' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Lỗi phân bàn:', error);
    res.status(500).json({ error: 'Phân bàn thất bại' });
  }
});

// Hủy phân bàn
router.put('/:id/unassign-table', verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const bookingId = req.params.id;

    const result = await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $unset: {
          tableId: '',
          tableNumber: ''
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đặt bàn' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Lỗi hủy phân bàn:', error);
    res.status(500).json({ error: 'Hủy phân bàn thất bại' });
  }
});

export default router;

