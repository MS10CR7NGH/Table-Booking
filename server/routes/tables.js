import express from 'express';
import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Lấy tất cả bàn
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const tables = await db.collection('tables')
      .find({})
      .sort({ tableNumber: 1 })
      .toArray();

    const settings = await db.collection('settings').findOne({ type: 'restaurant' });
    const totalCapacity = settings?.totalCapacity || 50;

    const formattedTables = tables.map(table => ({
      id: table._id.toString(),
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      location: table.location,
      isAvailable: table.isAvailable,
      description: table.description || '',
      _id: undefined
    }));

    res.json({
      tables: formattedTables,
      totalCapacity
    });
  } catch (error) {
    console.error('❌ Lỗi lấy bàn:', error);
    res.status(500).json({ error: 'Lấy bàn thất bại' });
  }
});

// Tạo bàn mới
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const { tableNumber, capacity, location, isAvailable, description } = req.body;

    if (!tableNumber || !capacity || !location) {
      return res.status(400).json({ error: 'Thiếu các trường bắt buộc' });
    }

    const table = {
      tableNumber: parseInt(tableNumber),
      capacity: parseInt(capacity),
      location,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('tables').insertOne(table);
    table._id = result.insertedId;
    table.id = result.insertedId.toString();

    res.json({
      success: true,
      table: {
        id: table.id,
        ...table,
        _id: undefined
      }
    });
  } catch (error) {
    console.error('❌ Lỗi tạo bàn:', error);
    res.status(500).json({ error: 'Tạo bàn thất bại' });
  }
});

// Cập nhật bàn
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const tableId = req.params.id;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Remove _id if present
    delete updateData._id;
    delete updateData.id;

    const result = await db.collection('tables').updateOne(
      { _id: new ObjectId(tableId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bàn' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Lỗi cập nhật bàn:', error);
    res.status(500).json({ error: 'Cập nhật bàn thất bại' });
  }
});

// Xóa bàn
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const tableId = req.params.id;

    const result = await db.collection('tables').deleteOne({ _id: new ObjectId(tableId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bàn' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Lỗi xóa bàn:', error);
    res.status(500).json({ error: 'Xóa bàn thất bại' });
  }
});

// Lấy bàn có sẵn
router.get('/available', async (req, res) => {
  try {
    const db = getDatabase();
    const { date, time, guests, preference } = req.query;

    if (!date || !time || !guests || !preference) {
      return res.status(400).json({ error: 'Thiếu tham số truy vấn' });
    }

    // Lấy tất cả bàn
    const allTables = await db.collection('tables').find({}).toArray();

    // Lấy đặt bàn cho ngày và giờ này
    const bookings = await db.collection('bookings').find({
      date,
      time,
      tableId: { $exists: true, $ne: null }
    }).toArray();

    const bookedTableIds = bookings.map(b => b.tableId);

    // Lọc bàn có sẵn
    const availableTables = allTables
      .filter(table => {
        const tableId = table._id.toString();
        return (
          table.isAvailable &&
          table.location === preference &&
          table.capacity >= parseInt(guests) &&
          !bookedTableIds.includes(tableId)
        );
      })
      .sort((a, b) => a.tableNumber - b.tableNumber)
      .map(table => ({
        id: table._id.toString(),
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location,
        isAvailable: table.isAvailable,
        description: table.description || ''
      }));

    res.json({ tables: availableTables });
  } catch (error) {
    console.error('❌ Lỗi lấy bàn có sẵn:', error);
    res.status(500).json({ error: 'Lấy bàn có sẵn thất bại' });
  }
});

export default router;

