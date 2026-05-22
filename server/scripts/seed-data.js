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
    name: 'Salad Caesar',
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
  },
  {
    name: 'Pâté Foie Gras',
    description: 'Pâté gan ngỗng cao cấp, phục vụ kèm bánh mì nướng và dưa chuột tươi',
    price: 280000,
    image: 'https://tse2.mm.bing.net/th/id/OIP.Cbz8lyz3LHce_9XPzI5gPQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    category: 'starters',
    isVeg: false,
    isChefSpecial: true,
    isAvailable: true
  },
  {
    name: 'Soupe à l\'Oignon Gratinée',
    description: 'Súp hành tây Pháp truyền thống, nấu lâu với nước dùng thịt bò và phomai',
    price: 95000,
    image: 'https://th.bing.com/th/id/OIP.DZTCxeQKtBAQy9_kvbBEQwHaHa?w=184&h=184&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'starters',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true
  },
  {
    name: 'Escargots de Bourgogne',
    description: 'Ốc sên Burgundy với sốt bơ tỏi hành tây, nướng hoàn hảo',
    price: 185000,
    image: 'https://th.bing.com/th/id/OIP.xMGOzxk6BxMWP18C4TGHOAHaHa?w=175&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'starters',
    isVeg: false,
    isChefSpecial: true,
    isAvailable: true
  },
  {
    name: 'Crevettes à l\'Ail',
    description: 'Tôm tươi với sốt bơ tỏi, rượu trắng và chanh tươi',
    price: 220000,
    image: 'https://th.bing.com/th/id/OIP.KWlXnuPiJ-tL-9QG0YGlVAHaE8?w=273&h=182&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'starters',
    isVeg: false,
    isChefSpecial: false,
    isAvailable: true
  },
  {
    name: 'Salade Niçoise',
    description: 'Salad truyền thống từ Nice với cá ngừ, trứng, cà chua và ô liu',
    price: 145000,
    image: 'https://th.bing.com/th/id/OIP.cT7SzcG0eX-VXp0kGTVr0wHaEU?w=308&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'starters',
    isVeg: false,
    isChefSpecial: false,
    isAvailable: true
  },
  {
    name: 'Coq au Vin',
    description: 'Gà nấu với rượu vang đỏ Burgundy, nấm và hành tây, thịt mềm tan',
    price: 320000,
    image: 'https://th.bing.com/th/id/OIP.gliulHf0XUMc7gipV4vgDAHaHa?w=189&h=189&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'mains',
    isVeg: false,
    isChefSpecial: true,
    isAvailable: true
  },
  {
    name: 'Beef Bourguignon',
    description: 'Thịt bò nấu chậm với rượu vang đỏ, cà rốt, khoai tây và nấm',
    price: 380000,
    image: 'https://tse2.mm.bing.net/th/id/OIP.krKc5qSQDtyDIYjiz9K2zQHaHZ?rs=1&pid=ImgDetMain&o=7&rm=3',
    category: 'mains',
    isVeg: false,
    isChefSpecial: true,
    isAvailable: true
  },
  {
    name: 'Duck Confit',
    description: 'Vịt nấu chậm trong chính mỡ của nó cho đến khi thịt rất mềm',
    price: 350000,
    image: 'https://th.bing.com/th/id/OIP.k5CQzJNQvDeSMX6S8EQC2wHaGe?w=223&h=195&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'mains',
    isVeg: false,
    isChefSpecial: true,
    isAvailable: true
  },
  {
    name: 'Sole Meunière',
    description: 'Cá song tươi, chiên với bơ nóng, nước cốt chanh và hạnh nhân',
    price: 320000,
    image: 'https://th.bing.com/th/id/OIP.93S4Lmh1KPkPg-tHfIADzQHaGY?w=189&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'mains',
    isVeg: false,
    isChefSpecial: false,
    isAvailable: true
  },
  {
    name: 'Steak Frites',
    description: 'Bít tết cao cấp nướng chuẩn mực Pháp, phục vụ với khoai chiên vàng',
    price: 420000,
    image: 'https://th.bing.com/th/id/OIP.wYDQgMpvdAo49ktkSia6SQHaEO?w=284&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'mains',
    isVeg: false,
    isChefSpecial: false,
    isAvailable: true
  },
  {
    name: 'Blanquette de Veau',
    description: 'Thịt bê trắng nấu trong sốt kem trắng, cà rốt và hành tây',
    price: 300000,
    image: 'https://th.bing.com/th/id/OIP.IykED2zwCBiLDe5vj0dntgHaE8?w=247&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'mains',
    isVeg: false,
    isChefSpecial: false,
    isAvailable: true
  },
  {
    name: 'Quiche Lorraine',
    description: 'Bánh Quiche với thịt lợn, trứng và kem tươi, vỏ ngoài giòn',
    price: 165000,
    image: 'https://th.bing.com/th/id/OIP.6AelH4gW-xx3IQersT4AYQHaE8?w=284&h=189&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'mains',
    isVeg: false,
    isChefSpecial: false,
    isAvailable: true
  },
  {
    name: 'Crème Brûlée',
    description: 'Kem cứng truyền thống với lớp đường caramel giòn tan',
    price: 120000,
    image: 'https://th.bing.com/th/id/OIP.nAk-pQxLMwmrSunMiEfH-gHaHa?w=208&h=208&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'desserts',
    isVeg: true,
    isChefSpecial: true,
    isAvailable: true
  },
  {
    name: 'Tarte Tatin',
    description: 'Bánh táo nướng với caramel, ăn nóng kèm kem vani',
    price: 125000,
    image: 'https://th.bing.com/th/id/OIP.7uQJCMWsAgHWbPksqiFkwgHaEK?w=302&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'desserts',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true
  },
  {
    name: 'Macarons Pháp',
    description: 'Bánh macaron nhập khẩu từ Pháp với các hương vị đa dạng',
    price: 85000,
    image: 'https://th.bing.com/th/id/OIP.OuTSPFw0sdAoJTPhdNPEogHaEo?w=262&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'desserts',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true
  },
  {
    name: 'Éclairs au Chocolat',
    description: 'Bánh ngàn tầu với kem nhân và glaze chocolate đen đắng',
    price: 95000,
    image: 'https://th.bing.com/th/id/OIP.Abh7ZIsV1xoVPXCYXVakHgHaHa?w=173&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'desserts',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true
  },
  {
    name: 'Panna Cotta',
    description: 'Bánh kem Ý-Pháp mịn mềm với nước sốt quả mọng',
    price: 110000,
    image: 'https://th.bing.com/th/id/OIP.K5hoQ1fGr_gPR6RXdRU9CQHaE8?w=283&h=189&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'desserts',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true
  },
  {
    name: 'Champagne Krug',
    description: 'Rượu Champagne hảo hạng từ Pháp, tươi mát và thanh lịch',
    price: 850000,
    image: 'https://th.bing.com/th/id/OIP.OhExE5hAbLzfu_grXDmaUwHaHa?w=208&h=208&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'drinks',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true
  },
  {
    name: 'Rượu Vang Đỏ Bordeaux',
    description: 'Rượu vang đỏ cao cấp từ vùng Bordeaux, vị đậm đà',
    price: 650000,
    image: 'https://th.bing.com/th/id/OIP.hH_L10CfdiNZvLbNAF3GRwHaHa?w=180&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'drinks',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true
  },
  {
    name: 'Pastis Ricard',
    description: 'Rượu Pastis truyền thống Pháp, hương thảo và hành tây',
    price: 185000,
    image: 'https://th.bing.com/th/id/OIP._bwiJYMDmGwYhYN4p4fRfAHaHa?w=208&h=208&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    category: 'drinks',
    isVeg: true,
    isChefSpecial: false,
    isAvailable: true
  }
];

const defaultSettings = {
  restaurantName: 'DinnerThings Admin',
  email: 'admin@dinnerthings.vn',
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
  name: 'DinnerThings Admin',
  email: 'admin@dinnerthings.vn',
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

