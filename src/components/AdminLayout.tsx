import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Utensils, Settings, TrendingUp, TableProperties, ClipboardList, LogOut, UtensilsCrossed, ChevronRight } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Button } from './ui/button';
import { motion } from 'motion/react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Bảng điều khiển' },
    { path: '/admin/tables', icon: TableProperties, label: 'Bàn' },
    { path: '/admin/table-assignments', icon: ClipboardList, label: 'Phân bàn' },
    { path: '/admin/menu', icon: Utensils, label: 'Thực đơn' },
    { path: '/admin/analytics', icon: TrendingUp, label: 'Phân tích' },
    { path: '/admin/settings', icon: Settings, label: 'Cài đặt' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Admin Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg border border-white/30"
              >
                <UtensilsCrossed className="text-black w-6 h-6" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-black">DinnerThings Admin</h1>
                <p className="text-xs text-amber-100">Quản lý nhà hàng</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {admin && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-right hidden sm:block"
                >
                  <p className="text-sm font-semibold text-black">{admin.name}</p>
                  <p className="text-xs text-amber-100">{admin.email}</p>
                </motion.div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border-white/30 text-black hover:text-black"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
              <Link
                to="/"
                className="text-sm text-black/80 hover:text-black transition-colors flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
                <span className=" sm:inline">Về Trang Web</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 overflow-x-auto py-2">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap font-medium text-sm ${
                      isActive
                        ? 'bg-amber-600/90 text-black shadow-lg'
                        : 'text-gray-300 hover:text-black hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="py-8"
      >
        <Outlet />
      </motion.div>
    </div>
  );
}