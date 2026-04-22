import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database.js';

const router = express.Router();

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
    }

    const db = getDatabase();
    const adminUser = await db.collection('admin_users').findOne({ email: email.toLowerCase() });

    if (!adminUser) {
      return res.status(401).json({ error: 'Thông tin đăng nhập không chính xác' });
    }

    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Thông tin đăng nhập không chính xác' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET chưa được cấu hình trong file .env');
      return res.status(500).json({ error: 'Máy chủ chưa được cấu hình bảo mật' });
    }

    const token = jwt.sign(
      {
        userId: adminUser._id.toString(),
        email: adminUser.email,
        role: 'admin'
      },
      secret,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: sanitizeUser(adminUser)
    });
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error);
    res.status(500).json({ error: 'Đăng nhập thất bại, vui lòng thử lại' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Thiếu token' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET chưa được cấu hình trong file .env');
      return res.status(500).json({ error: 'Máy chủ chưa được cấu hình bảo mật' });
    }
    const decoded = jwt.verify(token, secret);

    const db = getDatabase();
    const adminUser = await db
      .collection('admin_users')
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (!adminUser) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    }

    res.json({ user: sanitizeUser(adminUser) });
  } catch (error) {
    console.error('❌ Lỗi xác thực token:', error);
    res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
});

export default router;

