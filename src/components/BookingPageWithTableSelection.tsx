import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Check, Utensils, Download, Armchair, StickyNote } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { buildApiUrl } from '../utils/api/config';

interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  location: 'indoor' | 'outdoor';
  isAvailable: boolean;
  description?: string;
  isBooked?: boolean;
}

export default function BookingPageWithTableSelection() {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('');
  const [diningPreference, setDiningPreference] = useState('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  // Generate available time slots
  const timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
    '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
    '9:00 PM', '9:30 PM', '10:00 PM'
  ];

  // Fetch available tables when date, time, guests, and preference are selected
  useEffect(() => {
    if (date && time && guests && diningPreference && step === 2) {
      fetchAvailableTables();
    }
  }, [date, time, guests, diningPreference, step]);

  const fetchAvailableTables = async () => {
    if (!date || !time || !guests || !diningPreference) return;
    
    setIsLoadingTables(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(
        buildApiUrl(`/tables/available?date=${dateStr}&time=${encodeURIComponent(time)}&guests=${guests}&preference=${diningPreference}`)
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableTables(data.tables || []);
      } else {
        toast.error('Failed to load available tables');
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to load tables');
    } finally {
      setIsLoadingTables(false);
    }
  };

  const handleContinueToTableSelection = () => {
    if (!date || !time || !guests || !diningPreference) {
      toast.error('Please fill in all fields');
      return;
    }
    setStep(2);
  };

  const handleContinueToContactInfo = () => {
    if (!selectedTable) {
      toast.error('Vui lòng chọn bàn');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !guests || !diningPreference || !selectedTable || !name || !email || !phone) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const response = await fetch(
        buildApiUrl('/bookings'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            date: date.toISOString().split('T')[0],
            time,
            guests: parseInt(guests),
            diningPreference,
            tableId: selectedTable.id,
            tableNumber: selectedTable.tableNumber,
            note: note.trim()
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookingId(data.bookingId);
        setIsSubmitted(true);
        toast.success('Đặt bàn thành công! Vui lòng kiểm tra email để xem chi tiết.');
        
        setTimeout(() => {
          toast.info('Email xác nhận đã được gửi đến ' + email);
        }, 1000);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Đặt bàn thất bại');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Gửi đặt bàn thất bại. Vui lòng thử lại.');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const downloadImage = async () => {
    const summary = document.getElementById('booking-with-table-summary');
    if (!summary) return;

    const { toPng } = await import('html-to-image');
    try {
      const dataUrl = await toPng(summary);
    const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `AuraDining_Booking_${bookingId || Date.now()}.png`;
    link.click();
      toast.success('Đã tải ảnh chi tiết đặt bàn!');
    } catch (error) {
      console.error('Failed to download image', error);
      toast.error('Tải ảnh thất bại');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center" id="booking-with-table-summary">
              <CardContent className="p-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl mb-4">Đặt bàn thành công!</h1>
                <p className="text-gray-600 mb-6">
                  Cảm ơn bạn, {name}! Bàn của bạn đã được đặt.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                  <h3 className="mb-4">Chi tiết đặt bàn</h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-amber-600" />
                      <span>{date && formatDate(date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-3 text-amber-600" />
                      <span>{time}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-3 text-amber-600" />
                      <span>{guests} {parseInt(guests) === 1 ? 'Khách' : 'Khách'}</span>
                    </div>
                    <div className="flex items-center">
                      <Armchair className="w-5 h-5 mr-3 text-amber-600" />
                      <span>Bàn {selectedTable?.tableNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-3 text-amber-600" />
                      <span>{diningPreference === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}</span>
                    </div>
                    {note && (
                      <div className="flex items-start">
                        <StickyNote className="w-5 h-5 mr-3 text-amber-600 mt-0.5" />
                        <span>{note}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-amber-800 mb-2">
                    Email xác nhận đã được gửi đến <strong>{email}</strong> và SMS đến <strong>{phone}</strong>
                  </p>
                  {bookingId && (
                    <p className="text-xs text-amber-700">
                      Mã đặt bàn: <strong>{bookingId}</strong>
                    </p>
                  )}
                </div>

                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => {
                      setIsSubmitted(false);
                      setStep(1);
                      setSelectedTable(null);
                    }}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Đặt bàn khác
                  </Button>
                  <Button 
                    onClick={downloadImage}
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Tải về
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= s ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {idx < 2 && (
                  <div className={`w-20 h-1 mx-2 ${
                    step > s ? 'bg-amber-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 text-sm text-gray-600">
            <span className="w-32 text-center">Ngày & Giờ</span>
            <span className="w-32 text-center">Chọn bàn</span>
            <span className="w-32 text-center">Thông tin liên hệ</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Chi tiết đặt bàn'}
              {step === 2 && 'Chọn bàn của bạn'}
              {step === 3 && 'Thông tin liên hệ'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 1: Date, Time, Guests, Preference */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label>Chọn ngày</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? formatDate(date) : <span className="text-gray-500">Chọn ngày dùng bữa</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => setDate(newDate)}
                        initialFocus
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Chọn giờ</Label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giờ" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Số lượng khách</Label>
                    <Select value={guests} onValueChange={setGuests}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn số khách" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Khách' : 'Khách'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Sở thích chỗ ngồi</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDiningPreference('indoor')}
                      className={`p-6 border-2 rounded-lg transition-all ${
                        diningPreference === 'indoor'
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Utensils className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                      <div className="text-center">Trong nhà</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiningPreference('outdoor')}
                      className={`p-6 border-2 rounded-lg transition-all ${
                        diningPreference === 'outdoor'
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <MapPin className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                      <div className="text-center">Ngoài trời</div>
                    </button>
                  </div>
                </div>

                <Button 
                  onClick={handleContinueToTableSelection}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  Tiếp tục chọn bàn
                </Button>
              </div>
            )}

            {/* Step 2: Table Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Hiển thị bàn cho {guests} khách vào {date && formatDate(date)} lúc {time} ({diningPreference === 'indoor' ? 'Trong nhà' : 'Ngoài trời'})
                  </p>
                </div>

                {isLoadingTables ? (
                  <div className="text-center py-8 text-gray-500">Đang tải bàn có sẵn...</div>
                ) : availableTables.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Không có bàn trống cho lựa chọn của bạn.</p>
                    <Button onClick={() => setStep(1)} variant="outline">
                      Đổi ngày/giờ
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {availableTables.map((table) => (
                      <button
                        key={table.id}
                        onClick={() => setSelectedTable(table)}
                        className={`p-6 border-2 rounded-lg transition-all text-center ${
                          selectedTable?.id === table.id
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Armchair className={`w-8 h-8 mx-auto mb-2 ${
                          selectedTable?.id === table.id ? 'text-amber-600' : 'text-gray-600'
                        }`} />
                        <div className="mb-1">Bàn {table.tableNumber}</div>
                        <div className="text-sm text-gray-600">
                          {table.capacity} chỗ
                        </div>
                        {table.description && (
                          <div className="text-xs text-gray-500 mt-1">{table.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                  >
                    Quay lại
                  </Button>
                  <Button 
                    onClick={handleContinueToContactInfo}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                    disabled={!selectedTable}
                  >
                    Tiếp tục
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Contact Information */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Địa chỉ email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nguyenvana@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+84 123 456 789"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="note">Ghi chú (tuỳ chọn)</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: dị ứng hải sản, cần không gian riêng..."
                    rows={3}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm mb-3">Tóm tắt đặt bàn</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Ngày: {date && formatDate(date)}</div>
                    <div>Giờ: {time}</div>
                    <div>Khách: {guests}</div>
                    <div>Bàn: {selectedTable?.tableNumber}</div>
                    <div>Vị trí: {diningPreference === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button"
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1"
                  >
                    Quay lại
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    Xác nhận đặt bàn
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}