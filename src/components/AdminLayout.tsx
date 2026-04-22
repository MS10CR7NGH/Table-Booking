import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Utensils, Settings, TrendingUp, TableProperties, ClipboardList, LogOut } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Button } from './ui/button';

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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">LB</span>
              </div>
              <div>
                <h1 className="text-lg">Aura Dining Admin</h1>
                <p className="text-xs text-gray-500">Quản lý nhà hàng</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {admin && (
                <div className="text-right">
                  <p className="text-sm font-medium">{admin.name}</p>
                  <p className="text-xs text-gray-500">{admin.email}</p>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </Button>
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
            >
                Về trang web
            </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <Outlet />
      </div>
    </div>
  );
}