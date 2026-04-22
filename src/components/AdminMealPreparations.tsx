import { useState, useEffect } from 'react';
import { ChefHat, Clock, RefreshCw, Printer } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { useAuthFetch } from '../hooks/useAuthFetch';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface SelectedMeal {
  menuItemId: string;
  quantity: number;
}

interface Booking {
  id: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  tableNumber: number;
  selectedMeals: SelectedMeal[];
  note?: string;
}

interface MealPreparation {
  itemId: string;
  itemName: string;
  category: string;
  totalQuantity: number;
  bookings: Array<{
    bookingId: string;
    customerName: string;
    time: string;
    tableNumber: number;
    quantity: number;
  }>;
}

export default function AdminMealPreparations() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [preparations, setPreparations] = useState<MealPreparation[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const authFetch = useAuthFetch();

  const calculatePreparations = (bookingsData: Booking[], menuData: MenuItem[]) => {
    const prepMap: { [key: string]: MealPreparation } = {};

    bookingsData.forEach(booking => {
      booking.selectedMeals?.forEach(meal => {
        const menuItem = menuData.find(m => m.id === meal.menuItemId);
        if (!menuItem) return;

        if (!prepMap[meal.menuItemId]) {
          prepMap[meal.menuItemId] = {
            itemId: meal.menuItemId,
            itemName: menuItem.name,
            category: menuItem.category,
            totalQuantity: 0,
            bookings: []
          };
        }

        prepMap[meal.menuItemId].totalQuantity += meal.quantity;
        prepMap[meal.menuItemId].bookings.push({
          bookingId: booking.id,
          customerName: booking.name,
          time: booking.time,
          tableNumber: booking.tableNumber,
          quantity: meal.quantity
        });
      });
    });

    const prepsArray = Object.values(prepMap).sort((a, b) => 
      a.itemName.localeCompare(b.itemName)
    );

    setPreparations(prepsArray);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch bookings for the date
      const bookingsResponse = await authFetch(`/bookings/date/${filterDate}`);

      // Fetch menu items
      const menuResponse = await authFetch('/menu');

      if (bookingsResponse.ok && menuResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        const menuData = await menuResponse.json();
        
        const filteredBookings = (bookingsData.bookings || []).filter(
          (b: Booking) => b.selectedMeals && b.selectedMeals.length > 0
        );
        
        setBookings(filteredBookings);
        setMenuItems(menuData.items || []);
        
        calculatePreparations(filteredBookings, menuData.items || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Tải dữ liệu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterDate, authFetch]);

  const filteredPreparations = activeCategory === 'all'
    ? preparations
    : preparations.filter(p => p.category === activeCategory);

  const getPreparationsByCategory = (category: string) => {
    return preparations.filter(p => p.category === category);
  };

  const getTotalItemsCount = () => {
    return preparations.reduce((sum, p) => sum + p.totalQuantity, 0);
  };

  const printPreparationList = () => {
    window.print();
    toast.success('Đang mở hộp thoại in...');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Chuẩn bị món ăn</h1>
        <p className="text-gray-600">Xem và quản lý món ăn đã đặt trước cho bếp chuẩn bị</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Label htmlFor="filterDate" className="mb-2 block">Chọn ngày</Label>
          <Input
            id="filterDate"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div className="flex gap-3 items-end">
          <Button
            onClick={fetchData}
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button
            onClick={printPreparationList}
            variant="outline"
            disabled={preparations.length === 0}
          >
            <Printer className="w-4 h-4 mr-2" />
            In danh sách
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tổng đặt trước</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{bookings.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tổng số món</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-amber-600">{getTotalItemsCount()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Khai vị</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{getPreparationsByCategory('starters').reduce((sum, p) => sum + p.totalQuantity, 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Món chính</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{getPreparationsByCategory('mains').reduce((sum, p) => sum + p.totalQuantity, 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tráng miệng & Đồ uống</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">
              {getPreparationsByCategory('desserts').reduce((sum, p) => sum + p.totalQuantity, 0) +
               getPreparationsByCategory('drinks').reduce((sum, p) => sum + p.totalQuantity, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Đang tải...</div>
      ) : preparations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Không có món ăn đặt trước cho {filterDate}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Preparation List by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-600" />
                Danh sách chuẩn bị bếp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">
                    Tất cả ({preparations.length})
                  </TabsTrigger>
                  <TabsTrigger value="starters">
                    Khai vị ({getPreparationsByCategory('starters').length})
                  </TabsTrigger>
                  <TabsTrigger value="mains">
                    Món chính ({getPreparationsByCategory('mains').length})
                  </TabsTrigger>
                  <TabsTrigger value="desserts">
                    Tráng miệng ({getPreparationsByCategory('desserts').length})
                  </TabsTrigger>
                  <TabsTrigger value="drinks">
                    Đồ uống ({getPreparationsByCategory('drinks').length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeCategory} className="mt-6">
                  <div className="space-y-4">
                    {filteredPreparations.map((prep) => (
                      <Card key={prep.itemId} className="border-2 border-amber-100">
                        <CardHeader className="bg-amber-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl">
                                {prep.totalQuantity}
                              </div>
                              <div>
                                <h3 className="mb-1">{prep.itemName}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {prep.category.charAt(0).toUpperCase() + prep.category.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            <Badge className="bg-amber-600">
                              {prep.bookings.length} {prep.bookings.length === 1 ? 'đặt bàn' : 'đặt bàn'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            {prep.bookings.map((booking, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm border-l-2 border-amber-300 pl-3 py-2">
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    {booking.quantity}
                                  </div>
                                  <div>
                                    <div className="text-gray-900">{booking.customerName}</div>
                                    <div className="text-xs text-gray-500">
                                      Bàn {booking.tableNumber} • {booking.time}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Timeline View */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Dòng thời gian chuẩn bị
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((booking) => (
                    <div key={booking.id} className="border-l-4 border-amber-600 pl-4 py-2">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{booking.time}</span>
                        <Badge variant="outline">Bàn {booking.tableNumber}</Badge>
                        <span className="text-gray-600">{booking.name}</span>
                        <Badge className="bg-blue-600">{booking.guests} khách</Badge>
                      </div>
                      <div className="ml-7 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {booking.selectedMeals.map((meal, idx) => {
                          const menuItem = menuItems.find(m => m.id === meal.menuItemId);
                          return (
                            <div key={idx} className="text-sm bg-gray-50 rounded px-3 py-2">
                              <span className="text-amber-600">{meal.quantity}×</span> {menuItem?.name || 'Không xác định'}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}