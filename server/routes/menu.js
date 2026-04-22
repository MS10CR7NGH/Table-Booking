import express from 'express';
import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Lấy tất cả món ăn
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const items = await db.collection('menu_items')
      .find({})
      .sort({ name: 1 })
      .toArray();

    const formattedItems = items.map(item => ({
      id: item._id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.category,
      isVeg: item.isVeg,
      isChefSpecial: item.isChefSpecial,
      isAvailable: item.isAvailable,
      _id: undefined
    }));

    res.json({ items: formattedItems });
  } catch (error) {
    console.error('❌ Lỗi lấy món ăn:', error);
    res.status(500).json({ error: 'Lấy món ăn thất bại' });
  }
});

// Tạo món ăn mới
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const { name, description, price, image, category, isVeg, isChefSpecial, isAvailable } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Thiếu các trường bắt buộc' });
    }

    const menuItem = {
      name,
      description: description || '',
      price: parseFloat(price),
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      category,
      isVeg: isVeg !== undefined ? isVeg : true,
      isChefSpecial: isChefSpecial !== undefined ? isChefSpecial : false,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('menu_items').insertOne(menuItem);
    menuItem._id = result.insertedId;
    menuItem.id = result.insertedId.toString();

    res.json({
      success: true,
      item: {
        id: menuItem.id,
        ...menuItem,
        _id: undefined
      }
    });
  } catch (error) {
    console.error('❌ Lỗi tạo món ăn:', error);
    res.status(500).json({ error: 'Tạo món ăn thất bại' });
  }
});

// Cập nhật món ăn
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const menuId = req.params.id;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Convert price to float if present
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }

    // Remove _id if present
    delete updateData._id;
    delete updateData.id;

    const result = await db.collection('menu_items').updateOne(
      { _id: new ObjectId(menuId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Không tìm thấy món ăn' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Lỗi cập nhật món ăn:', error);
    res.status(500).json({ error: 'Cập nhật món ăn thất bại' });
  }
});

// Xóa món ăn
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const menuId = req.params.id;

    const result = await db.collection('menu_items').deleteOne({ _id: new ObjectId(menuId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Không tìm thấy món ăn' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Lỗi xóa món ăn:', error);
    res.status(500).json({ error: 'Xóa món ăn thất bại' });
  }
});

export default router;

