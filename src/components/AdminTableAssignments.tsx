import { useState, useEffect } from 'react';
import { Calendar, Users, Armchair, Edit2, X, Save, RefreshCw, Filter, StickyNote, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useAuthFetch } from '../hooks/useAuthFetch';
import { motion } from 'motion/react';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  diningPreference: string;
  tableId?: string;
  tableNumber?: number;
  status: string;
  note?: string;
}

interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  location: 'indoor' | 'outdoor';
  isAvailable: boolean;
  description?: string;
}

export default function AdminTableAssignments() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [rangeMode, setRangeMode] = useState<'day' | 'upcoming' | 'range'>('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTableId, setNewTableId] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const authFetch = useAuthFetch();

  useEffect(() => {
    fetchData();
  }, [filterDate, rangeMode, startDate, endDate, authFetch]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch bookings
      const bookingsEndpoint = rangeMode === 'day'
        ? `/bookings/date/${filterDate}`
        : '/bookings';
      const bookingsResponse = await authFetch(bookingsEndpoint);

      // Fetch tables
      const tablesResponse = await authFetch('/tables');

      if (bookingsResponse.ok && tablesResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        const tablesData = await tablesResponse.json();
        
        let list: Booking[] = bookingsData.bookings || [];

        const normalize = (value: string) => {
          const d = new Date(value);
          d.setHours(0, 0, 0, 0);
          return d;
        };

        if (rangeMode === 'upcoming') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          list = list.filter((b: Booking) => {
            const d = normalize(b.date);
            return d >= today;
          });
        }

        if (rangeMode === 'range' && (startDate || endDate)) {
          const from = startDate ? normalize(startDate) : null;
          const to = endDate ? normalize(endDate) : null;

          list = list.filter((b: Booking) => {
            const d = normalize(b.date);
            if (from && d < from) return false;
            if (to && d > to) return false;
            return true;
          });
        }

        setBookings(list);
        setTables(tablesData.tables || []);
      } else {
        setBookings([]);
        setTables([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Tải dữ liệu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTable = async () => {
    if (!selectedBooking || !newTableId) {
      toast.error('Vui lòng chọn một bàn');
      return;
    }

    try {
      const selectedTable = tables.find(t => t.id === newTableId);
      
      const response = await authFetch(`/bookings/${selectedBooking.id}/assign-table`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tableId: newTableId,
            tableNumber: selectedTable?.tableNumber
          })
      });

      if (response.ok) {
        toast.success('Phân bàn thành công');
        setIsDialogOpen(false);
        setSelectedBooking(null);
        setNewTableId('');
        fetchData();
      } else {
        toast.error('Phân bàn thất bại');
      }
    } catch (error) {
      console.error('Error assigning table:', error);
      toast.error('Lỗi khi phân bàn');
    }
  };

  const handleUnassignTable = async (bookingId: string) => {
    if (!confirm('Xóa phân bàn khỏi đặt bàn này?')) return;

    try {
      const response = await authFetch(`/bookings/${bookingId}/unassign-table`, {
        method: 'PUT'
      });

      if (response.ok) {
        toast.success('Hủy phân bàn thành công');
        fetchData();
      } else {
        toast.error('Hủy phân bàn thất bại');
      }
    } catch (error) {
      console.error('Error unassigning table:', error);
      toast.error('Lỗi khi hủy phân bàn');
    }
  };

  const openAssignDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewTableId(booking.tableId || '');
    setIsDialogOpen(true);
  };

  const getAvailableTablesForBooking = (booking: Booking) => {
    // Filter tables that match the booking's dining preference and have sufficient capacity
    return tables.filter(table => 
      table.location === booking.diningPreference && 
      table.capacity >= booking.guests &&
      table.isAvailable &&
      (!table.id || table.id === booking.tableId || !isTableBooked(table.id))
    );
  };

  const isTableBooked = (tableId: string) => {
    return bookings.some(b => b.tableId === tableId && b.id !== selectedBooking?.id);
  };

  const getTableAssignments = () => {
    const assignments: { [key: string]: Booking[] } = {};
    
    tables.forEach(table => {
      assignments[table.id] = bookings.filter(b => b.tableId === table.id);
    });

    return assignments;
  };

  const tableAssignments = getTableAssignments();

  const getEarliestAssignmentTime = (assignments: Booking[]): number | null => {
    if (!assignments.length) return null;
    let min = Number.MAX_SAFE_INTEGER;
    for (const b of assignments) {
      // date dạng YYYY-MM-DD, time dạng '6:00 PM' -> ghép lại thành Date
      const dt = new Date(`${b.date} ${b.time}`);
      const t = dt.getTime();
      if (!Number.isNaN(t) && t < min) {
        min = t;
      }
    }
    return min === Number.MAX_SAFE_INTEGER ? null : min;
  };

  // Sắp xếp: bàn có khách trước, rồi theo thời gian đặt sớm nhất, cuối cùng theo số bàn
  const sortedTables = [...tables].sort((a, b) => {
    const aAssignments = tableAssignments[a.id] || [];
    const bAssignments = tableAssignments[b.id] || [];
    const aOccupied = aAssignments.length > 0;
    const bOccupied = bAssignments.length > 0;

    if (aOccupied !== bOccupied) {
      return aOccupied ? -1 : 1; // đã có khách lên đầu
    }

    const aTime = getEarliestAssignmentTime(aAssignments);
    const bTime = getEarliestAssignmentTime(bAssignments);

    if (aTime !== null && bTime !== null && aTime !== bTime) {
      return aTime - bTime; // thời gian sớm hơn trước
    }

    // Nếu cùng trạng thái / không có thời gian, sắp theo số bàn
    return a.tableNumber - b.tableNumber;
  });
  const unassignedBookings = bookings.filter(b => !b.tableId);

  return (
    <div className="min-h-screen bg-gray-50 py-12"> 
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-gray-900">Phân bàn</h1>
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
        <p className="text-gray-600">Quản lý phân bàn cho các đặt chỗ</p>
      </motion.div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Tổng đặt bàn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Armchair className="w-4 h-4 text-green-600" />
              Đã phân bàn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {bookings.filter(b => b.tableId).length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-600" />
              Chưa phân bàn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">
              {unassignedBookings.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Tổng số khách
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {bookings.reduce((sum, b) => sum + b.guests, 0)}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
      >
        <div className="flex flex-col gap-6">
          {/* Filter Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Bộ lọc</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label className="text-xs font-medium text-gray-600 mb-2 block">Phạm vi thời gian</Label>
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    type="button"
                    variant={rangeMode === 'day' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setRangeMode('day')}
                    className={`flex-1 ${rangeMode === 'day' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                  >
                    Theo ngày
                  </Button>
                  <Button
                    type="button"
                    variant={rangeMode === 'upcoming' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setRangeMode('upcoming')}
                    className={`flex-1 ${rangeMode === 'upcoming' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                  >
                    Sắp tới
                  </Button>
                  <Button
                    type="button"
                    variant={rangeMode === 'range' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setRangeMode('range')}
                    className={`flex-1 ${rangeMode === 'range' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                  >
                    Khoảng
                  </Button>
                </div>
              </div>

              {rangeMode === 'day' && (
                <div className="flex-1">
                  <Label htmlFor="filterDate" className="text-xs font-medium text-gray-600 mb-2 block">Chọn ngày</Label>
                  <Input
                    id="filterDate"
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </div>
              )}

              {rangeMode === 'range' && (
                <div className="flex-1 flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs font-medium text-gray-600 mb-2 block">Từ ngày</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-medium text-gray-600 mb-2 block">Đến ngày</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* View Mode */}
          <div>
            <Label className="text-xs font-medium text-gray-600 mb-2 block">Chế độ xem</Label>
            <div className="flex border rounded-lg w-fit">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                Danh sách
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                Lưới
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="inline-block">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
            <p className="text-gray-500 mt-2">Đang tải dữ liệu...</p>
          </div>
        </motion.div>
      ) : bookings.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="py-16 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                {rangeMode === 'day' && <>Không tìm thấy đặt bàn cho {filterDate}</>}
                {rangeMode === 'upcoming' && <>Không tìm thấy đặt bàn sắp tới</>}
                {rangeMode === 'range' && (startDate || endDate) && (
                  <>Không tìm thấy đặt bàn trong khoảng {startDate || '...'} đến {endDate || '...'}</>
                )}
                {rangeMode === 'range' && !startDate && !endDate && <>Vui lòng chọn khoảng thời gian</>}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {viewMode === 'list' ? (
            /* List View */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Unassigned Bookings */}
              {unassignedBookings.length > 0 && (
                <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      Cần phân bàn ({unassignedBookings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {unassignedBookings.map((booking, idx) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-2 border-amber-200 bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">{booking.name}</h4>
                              <div className="text-sm text-gray-600 space-y-2">
                                <div className="flex flex-wrap gap-2 items-center">
                                  <Badge className="bg-amber-100 text-amber-800 border border-amber-300">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {booking.date}
                                  </Badge>
                                  <Badge className="bg-amber-100 text-amber-800 border border-amber-300">
                                    {booking.time}
                                  </Badge>
                                  <Badge variant="outline">{booking.guests} khách</Badge>
                                </div>
                                <div>{booking.email} • {booking.phone}</div>
                                {booking.note && (
                                  <div className="flex items-start text-sm text-amber-800 bg-amber-50 rounded p-2">
                                    <StickyNote className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="break-words">{booking.note}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => openAssignDialog(booking)}
                              className="bg-amber-600 hover:bg-amber-700 ml-4 flex-shrink-0"
                            >
                              <Armchair className="w-4 h-4 mr-2" />
                              Phân bàn
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Assigned Bookings */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Bàn đã được phân ({bookings.filter(b => b.tableId).length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {bookings.filter(b => b.tableId).map((booking, idx) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{booking.name}</h4>
                              <Badge className="bg-green-600 text-white">
                                <Armchair className="w-3 h-3 mr-1" />
                                Bàn {booking.tableNumber}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-2">
                              <div className="flex flex-wrap gap-2 items-center">
                                <Badge variant="outline">{booking.date}</Badge>
                                <Badge variant="outline">{booking.time}</Badge>
                                <Badge variant="outline">{booking.guests} khách</Badge>
                              </div>
                              <div>{booking.email} • {booking.phone}</div>
                              {booking.note && (
                                <div className="flex items-start text-sm text-gray-700 bg-gray-50 rounded p-2">
                                  <StickyNote className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="break-words">{booking.note}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAssignDialog(booking)}
                              className="hover:bg-amber-50"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnassignTable(booking.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Grid View */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {sortedTables.map((table, idx) => {
                const assignments = tableAssignments[table.id] || [];
                const isOccupied = assignments.length > 0;

                return (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className={`h-full border-2 transition-all hover:shadow-lg ${
                      isOccupied
                        ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <CardTitle className="text-lg">Bàn {table.tableNumber}</CardTitle>
                            <p className="text-xs text-gray-600 mt-1">
                              {table.capacity} chỗ • {table.location === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}
                            </p>
                          </div>
                          <Badge className={
                            isOccupied ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                          }>
                            {isOccupied ? 'Có khách' : 'Trống'}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {assignments.length > 0 ? (
                          <div className="space-y-2">
                            {assignments.map((booking) => (
                              <div
                                key={booking.id}
                                className="bg-white border border-green-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                              >
                                <div className="font-medium text-sm text-gray-900 mb-1 truncate">
                                  {booking.name}
                                </div>
                                <div className="text-xs text-gray-600 space-y-1 mb-2">
                                  <div className="flex gap-1 flex-wrap">
                                    <Badge variant="outline" className="text-xs">{booking.time}</Badge>
                                    <Badge variant="outline" className="text-xs">{booking.guests} khách</Badge>
                                  </div>
                                </div>
                                {booking.note && (
                                  <div className="text-xs text-amber-800 bg-amber-50 rounded p-1.5 mb-2">
                                    <StickyNote className="w-3 h-3 inline mr-1" />
                                    {booking.note.substring(0, 50)}...
                                  </div>
                                )}
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openAssignDialog(booking)}
                                    className="flex-1 h-7 text-xs"
                                  >
                                    Đổi
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUnassignTable(booking.id)}
                                    className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-400">
                            <Armchair className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Không có đặt bàn</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}

      {/* Assign Table Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBooking?.tableId ? 'Phân lại bàn' : 'Phân bàn'}
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm mb-2">Chi tiết đặt bàn</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{selectedBooking.name}</div>
                  <div>
                    <span className="inline-block px-2 py-0.5 mr-1 rounded-full bg-amber-50 text-amber-800 font-semibold">
                      {selectedBooking.date}
                    </span>
                    <span className="inline-block px-2 py-0.5 mr-1 rounded-full bg-amber-50 text-amber-800 font-semibold">
                      {selectedBooking.time}
                    </span>
                    • {selectedBooking.guests} khách
                  </div>
                  <div>Sở thích: {selectedBooking.diningPreference === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}</div>
                  {selectedBooking.note && (
                    <div className="flex items-start text-sm text-amber-800">
                      <StickyNote className="w-3.5 h-3.5 mr-1 mt-0.5" />
                      <span className="break-words">{selectedBooking.note}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="tableSelect">Chọn bàn</Label>
                <Select value={newTableId} onValueChange={setNewTableId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn một bàn" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTablesForBooking(selectedBooking).map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        Bàn {table.tableNumber} - {table.capacity} chỗ ({table.location === 'indoor' ? 'Trong nhà' : 'Ngoài trời'})
                        {table.description && ` - ${table.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Hiển thị bàn {selectedBooking.diningPreference === 'indoor' ? 'trong nhà' : 'ngoài trời'} với sức chứa ≥ {selectedBooking.guests}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleAssignTable}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  disabled={!newTableId}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Phân bàn
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
