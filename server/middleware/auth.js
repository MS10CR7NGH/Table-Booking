import jwt from 'jsonwebtoken';

export function verifyAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Chưa đăng nhập hoặc thiếu token' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET chưa được cấu hình trong file .env');
      return res.status(500).json({ error: 'Cấu hình bảo mật chưa hợp lệ' });
    }

    const decoded = jwt.verify(token, secret);
    req.admin = decoded;
    next();
  } catch (error) {
    console.error('❌ Token không hợp lệ:', error.message);
    return res.status(401).json({ error: 'Phiên đăng nhập hết hạn hoặc không hợp lệ' });
  }
}

