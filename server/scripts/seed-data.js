import { connectDatabase } from '../config/database.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

// Dữ liệu mẫu để seed
const sampleTables = [
  { tableNumber: 1, capacity: 4, location: 'indoor', isAvailable: true, description: 'Gần cửa sổ' },
  { tableNumber: 2, capacity: 2, location: 'indoor', isAvailable: true, description: 'Góc riêng' },
  { tableNumber: 3, capacity: 6, location: 'indoor', isAvailable: true, description: 'Bàn lớn' },
  { tableNumber: 4, capacity: 4, location: 'outdoor', isAvailable: true, description: 'Sân vườn' },
  { tableNumber: 5, capacity: 2, location: 'outdoor', isAvailable: true, description: 'Ban công' },
  { tableNumber: 6, capacity: 8, location: 'indoor', isAvailable: true, description: 'Phòng riêng' },
];

const sampleMenuItems = [
  {
    name: 'Salad Caesar Aura',
    description: 'Rau xà lách tươi, phô mai parmesan, bánh mì nướng và sốt Caesar đặc biệt',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1739436776460-35f309e3f887?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWVzYXIlMjBzYWxhZCUyMGZyZXNofGVufDF8fHx8MTc2NDM2MjExMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'starters',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true
  },
  {
    name: 'Pasta Nấm Truffle',
    description: 'Pasta tươi với nấm truffle đen, nấm rừng và phô mai parmesan trong sốt kem',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1676300184847-4ee4030409c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpc2glMjBnb3VybWV0fGVufDF8fHx8MTc2NDMwMzU1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'mains',
    isVeg: true,
    isChefSpecial: true,
    isAvailable: true
  },
  {
    name: 'Bánh Chocolate Lava',
    description: 'Bánh chocolate ấm với nhân tan chảy, kem vani và mứt quả mọng',
    price: 145000,
    image: 'https://images.unsplash.com/photo-1607257882338-70f7dd2ae344?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNzZXJ0JTIwY2hvY29sYXRlJTIwY2FrZXxlbnwxfHx8fDE3NjQzMTIzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'desserts',
    isVeg: true,
    isChefSpecial: true,
    isAvailable: true
  }
];

const defaultSettings = {
  restaurantName: 'Aura Dining',
  email: 'hello@auradining.vn',
  phone: '(+84) 236 123 4567',
  address: '15 Đ. 2 Tháng 9',
  city: 'Đà Nẵng',
  state: 'Việt Nam',
  zipCode: '',
  description: 'Trải nghiệm ẩm thực đẳng cấp giữa lòng Đà Nẵng. Hương vị tinh tế, dịch vụ tận tâm.',
  totalCapacity: 50,
  emailTemplate: `Kính chào {customerName},

Cảm ơn bạn đã đặt bàn tại {restaurantName}!

Chi tiết đặt bàn:
- Ngày: {date}
- Giờ: {time}
- Số khách: {guests} khách
- Chỗ ngồi: {diningPreference}

Chúng tôi rất mong được phục vụ bạn!

Trân trọng,
Đội ngũ {restaurantName}`,
  smsTemplate: 'Xin chào {customerName}! Bàn của bạn tại {restaurantName} đã được xác nhận cho {date} lúc {time} cho {guests} khách. Hẹn gặp bạn!'
};

const defaultHours = [
  { day: 'Monday', openTime: '11:00', closeTime: '22:00', isClosed: false },
  { day: 'Tuesday', openTime: '11:00', closeTime: '22:00', isClosed: false },
  { day: 'Wednesday', openTime: '11:00', closeTime: '22:00', isClosed: false },
  { day: 'Thursday', openTime: '11:00', closeTime: '22:00', isClosed: false },
  { day: 'Friday', openTime: '11:00', closeTime: '23:00', isClosed: false },
  { day: 'Saturday', openTime: '11:00', closeTime: '23:00', isClosed: false },
  { day: 'Sunday', openTime: '10:00', closeTime: '21:00', isClosed: false }
];

const defaultAdmin = {
  name: 'Aura Admin',
  email: 'admin@auradining.vn',
  password: '123456'
};

async function seedDatabase() {
  try {
    const db = await connectDatabase();

    // Seed tables
    console.log('📊 Đang seed bàn...');
    const existingTables = await db.collection('tables').countDocuments();
    if (existingTables === 0) {
      const tablesWithDates = sampleTables.map(table => ({
        ...table,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      await db.collection('tables').insertMany(tablesWithDates);
      console.log(`✅ Đã tạo ${sampleTables.length} bàn mẫu`);
    } else {
      console.log(`ℹ️  Đã có ${existingTables} bàn, bỏ qua seed bàn`);
    }

    // Seed menu items
    console.log('🍽️  Đang seed món ăn...');
    const existingMenuItems = await db.collection('menu_items').countDocuments();
    if (existingMenuItems === 0) {
      const menuItemsWithDates = sampleMenuItems.map(item => ({
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      await db.collection('menu_items').insertMany(menuItemsWithDates);
      console.log(`✅ Đã tạo ${sampleMenuItems.length} món ăn mẫu`);
    } else {
      console.log(`ℹ️  Đã có ${existingMenuItems} món ăn, bỏ qua seed món ăn`);
    }

    // Seed settings
    console.log('⚙️  Đang seed cài đặt...');
    await db.collection('settings').updateOne(
      { type: 'restaurant' },
      {
        $set: {
          type: 'restaurant',
          data: defaultSettings,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log('✅ Đã tạo cài đặt mặc định');

    await db.collection('settings').updateOne(
      { type: 'operating_hours' },
      {
        $set: {
          type: 'operating_hours',
          data: defaultHours,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log('✅ Đã tạo giờ mở cửa mặc định');

    // Seed admin user
    console.log('👤 Đang kiểm tra tài khoản admin...');
    const adminCollection = db.collection('admin_users');
    const existingAdmin = await adminCollection.findOne({ email: defaultAdmin.email });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(defaultAdmin.password, 10);
      await adminCollection.insertOne({
        name: defaultAdmin.name,
        email: defaultAdmin.email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Đã tạo tài khoản admin mặc định (${defaultAdmin.email})`);
    } else {
      console.log('ℹ️  Tài khoản admin đã tồn tại, bỏ qua seed admin');
    }

    console.log('\n🎉 Seed database hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi seed database:', error);
    process.exit(1);
  }
}

seedDatabase();

