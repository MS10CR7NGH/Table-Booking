import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import HomePage from './components/HomePage';
import BookingPageWithTableSelection from './components/BookingPageWithTableSelection';
import MenuPage from './components/MenuPage';
import AdminDashboard from './components/AdminDashboard';
import AdminLayout from './components/AdminLayout';
import AdminTableManagement from './components/AdminTableManagement';
import AdminTableAssignments from './components/AdminTableAssignments';
import AdminMenuManagement from './components/AdminMenuManagement';
import AdminAnalytics from './components/AdminAnalytics';
import AdminSettings from './components/AdminSettings';
import AdminLoginPage from './components/AdminLoginPage';
import { AdminGuard } from './components/AdminGuard';

function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
              <span className="text-white">LB</span>
            </div>
            <span className="text-gray-900">Aura Dining</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-amber-600 transition-colors">
              Trang chủ
            </Link>
            <Link to="/menu" className="text-gray-700 hover:text-amber-600 transition-colors">
              Thực đơn
            </Link>
            <Button onClick={() => navigate('/booking')} className="bg-amber-600 hover:bg-amber-700">
              Đặt bàn ngay
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block text-gray-700 hover:text-amber-600 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              to="/menu"
              className="block text-gray-700 hover:text-amber-600 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Thực đơn
            </Link>
            <Button 
              onClick={() => {
                navigate('/booking');
                setMobileMenuOpen(false);
              }} 
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              Đặt bàn ngay
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <div className="pt-20">
              <HomePage />
            </div>
            <Footer />
          </div>
        } />
        <Route path="/booking" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <div className="pt-20">
              <BookingPageWithTableSelection />
            </div>
            <Footer />
          </div>
        } />
        <Route path="/menu" element={
          <div className="min-h-screen bg-white">
            <Navigation />
            <div className="pt-20">
              <MenuPage />
            </div>
            <Footer />
          </div>
        } />

        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="tables" element={<AdminTableManagement />} />
          <Route path="table-assignments" element={<AdminTableAssignments />} />
          <Route path="menu" element={<AdminMenuManagement />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
                <span className="text-white">AD</span>
              </div>
              <span>Aura Dining</span>
            </div>
            <p className="text-gray-400 text-sm">
              Trải nghiệm ẩm thực đẳng cấp. Nguyên liệu tươi ngon, hương vị chân thực, khoảnh khắc khó quên.
            </p>
          </div>
          
          <div>
            <h3 className="mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-amber-600 transition-colors">Trang chủ</Link></li>
              <li><Link to="/menu" className="hover:text-amber-600 transition-colors">Thực đơn</Link></li>
              <li><Link to="/booking" className="hover:text-amber-600 transition-colors">Đặt bàn</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>15 Đ. 2 Tháng 9</li>
              <li>Hoà Cường Nam, Hải Châu, Đà Nẵng</li>
              <li>Điện thoại: (+84) 236 123 4567</li>
              <li>Email: hello@auradining.vn</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4">Giờ mở cửa</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Thứ 2 - Thứ 5: 11:00 - 22:00</li>
              <li>Thứ 6 - Thứ 7: 11:00 - 23:00</li>
              <li>Chủ nhật: 10:00 - 21:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Aura Dining. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}