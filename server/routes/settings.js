import express from 'express';
import { getDatabase } from '../config/database.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Lấy cài đặt
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const settings = await db.collection('settings').findOne({ type: 'restaurant' });
    const hours = await db.collection('settings').findOne({ type: 'operating_hours' });

    res.json({
      settings: settings?.data || {},
      hours: hours?.data || []
    });
  } catch (error) {
    console.error('❌ Lỗi lấy cài đặt:', error);
    res.status(500).json({ error: 'Lấy cài đặt thất bại' });
  }
});

// Cập nhật cài đặt
router.put('/', verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const { settings, hours } = req.body;

    if (settings) {
      await db.collection('settings').updateOne(
        { type: 'restaurant' },
        {
          $set: {
            type: 'restaurant',
            data: settings,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    if (hours) {
      await db.collection('settings').updateOne(
        { type: 'operating_hours' },
        {
          $set: {
            type: 'operating_hours',
            data: hours,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Lỗi cập nhật cài đặt:', error);
    res.status(500).json({ error: 'Cập nhật cài đặt thất bại' });
  }
});

// Cập nhật sức chứa
router.put('/capacity', verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const { totalCapacity } = req.body;

    await db.collection('settings').updateOne(
      { type: 'restaurant' },
      {
        $set: {
          'data.totalCapacity': totalCapacity,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Lỗi cập nhật sức chứa:', error);
    res.status(500).json({ error: 'Cập nhật sức chứa thất bại' });
  }
});

export default router;

