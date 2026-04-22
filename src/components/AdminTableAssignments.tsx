import { useState, useEffect } from 'react';
import { Calendar, Users, Armchair, Edit2, X, Save, RefreshCw, Filter, StickyNote } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { useAuthFetch } from '../hooks/useAuthFetch';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Phân bàn</h1>
        <p className="text-gray-600">Quản lý phân bàn cho các đặt chỗ</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex gap-2 items-center flex-wrap">
            <Label className="mb-0">Phạm vi</Label>
            <div className="flex border rounded-lg overflow-hidden text-sm">
              <Button
                type="button"
                variant={rangeMode === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setRangeMode('day')}
                className={rangeMode === 'day' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                Theo ngày
              </Button>
              <Button
                type="button"
                variant={rangeMode === 'upcoming' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setRangeMode('upcoming')}
                className={rangeMode === 'upcoming' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                Tất cả sắp tới
              </Button>
              <Button
                type="button"
                variant={rangeMode === 'range' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setRangeMode('range')}
                className={rangeMode === 'range' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                Khoảng thời gian
              </Button>
            </div>
          </div>

          {rangeMode === 'day' && (
          <Input
            id="filterDate"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          )}

          {rangeMode === 'range' && (
            <div className="flex gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Từ ngày"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Đến ngày"
              />
            </div>
          )}
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
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              Xem danh sách
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              Xem lưới
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tổng đặt bàn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{bookings.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Đã phân bàn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-green-600">
              {bookings.filter(b => b.tableId).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Chưa phân bàn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-amber-600">
              {unassignedBookings.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tổng số khách</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">
              {bookings.reduce((sum, b) => sum + b.guests, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Đang tải...</div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {rangeMode === 'day' && <>Không tìm thấy đặt bàn cho {filterDate}</>}
            {rangeMode === 'upcoming' && <>Không tìm thấy đặt bàn sắp tới</>}
            {rangeMode === 'range' && (startDate || endDate) && (
              <>Không tìm thấy đặt bàn trong khoảng {startDate || '...'} đến {endDate || '...'}</>
            )}
            {rangeMode === 'range' && !startDate && !endDate && <>Vui lòng chọn khoảng thời gian</>}
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'list' ? (
            /* List View */
            <div className="space-y-6">
              {/* Unassigned Bookings */}
              {unassignedBookings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-amber-600" />
                      Đặt bàn chưa phân bàn ({unassignedBookings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {unassignedBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="border-2 border-amber-200 bg-amber-50 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="mb-1">{booking.name}</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>
                                  <span className="inline-block px-2 py-0.5 mr-1 rounded-full bg-amber-50 text-amber-800 font-semibold">
                                    {booking.time}
                                  </span>
                                  • {booking.guests} khách • {booking.diningPreference === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}
                                </div>
                                <div>{booking.email} • {booking.phone}</div>
                                {booking.note && (
                                  <div className="flex items-start text-sm text-amber-800">
                                    <StickyNote className="w-3.5 h-3.5 mr-1 mt-0.5" />
                                    <span className="break-words">{booking.note}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => openAssignDialog(booking)}
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              <Armchair className="w-4 h-4 mr-2" />
                              Phân bàn
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Assigned Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Bàn đã được đặt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bookings.filter(b => b.tableId).map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4>{booking.name}</h4>
                              <Badge className="bg-green-600">
                                <Armchair className="w-3 h-3 mr-1" />
                                Bàn {booking.tableNumber}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>{booking.date} • {booking.time} • {booking.guests} khách • {booking.diningPreference === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}</div>
                              <div>{booking.email} • {booking.phone}</div>
                              {booking.note && (
                                <div className="flex items-start text-sm text-amber-800">
                                  <StickyNote className="w-3.5 h-3.5 mr-1 mt-0.5" />
                                  <span className="break-words">{booking.note}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAssignDialog(booking)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnassignTable(booking.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Grid View - Table Layout (reuse style from AdminTableManagement) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {sortedTables.map((table) => {
                const assignments = tableAssignments[table.id] || [];
                const isOccupied = assignments.length > 0;

                return (
                  <div
                    key={table.id}
                    className={`border-2 rounded-lg p-4 transition-colors ${
                      isOccupied
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg">Bàn {table.tableNumber}</h3>
                        <p className="text-sm text-gray-600">
                          {table.capacity} chỗ • {table.location === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}
                        </p>
                        </div>
                      <div
                        className={`px-2 py-1 rounded text-xs ${
                          isOccupied ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-900'
                        }`}
                      >
                        {isOccupied ? 'Đã có khách' : 'Có sẵn'}
                      </div>
                      </div>

                      {assignments.length > 0 ? (
                        <div className="space-y-2">
                          {assignments.map((booking) => (
                          <div
                            key={booking.id}
                            className="bg-white/70 border border-green-200 rounded-lg p-2 text-sm text-gray-700"
                          >
                            <div className="font-medium text-gray-900 mb-1 truncate">
                              {booking.name}
                            </div>
                            <div className="text-xs text-gray-700 mb-1">
                              <span className="inline-block px-2 py-0.5 mr-1 rounded-full bg-amber-50 text-amber-800 font-semibold">
                                {booking.date}
                              </span>
                              <span className="inline-block px-2 py-0.5 mr-1 rounded-full bg-amber-50 text-amber-800 font-semibold">
                                {booking.time}
                              </span>
                              • {booking.guests} khách • {booking.diningPreference === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}
                            </div>
                            {booking.note && (
                              <div className="flex items-start text-xs text-amber-800 mb-1">
                                <StickyNote className="w-3.5 h-3.5 mr-1 mt-0.5" />
                                <span className="break-words">{booking.note}</span>
                              </div>
                            )}
                            <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openAssignDialog(booking)}
                                className="flex-1 h-8 text-xs"
                                >
                                Đổi
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUnassignTable(booking.id)}
                                className="h-8 text-xs text-red-600"
                                >
                                Xóa
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                      <div className="text-sm text-gray-400 text-center py-4">
                        Không có đặt bàn
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
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
  );
}
